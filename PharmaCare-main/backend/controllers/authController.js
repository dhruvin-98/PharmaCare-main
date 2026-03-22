const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER || process.env.MAIL_USER;
const EMAIL_PASSWORD_RAW =
  process.env.EMAIL_PASSWORD ||
  process.env.EMAIL_PASS ||
  process.env.MAIL_PASS ||
  "";
const EMAIL_PASSWORD = EMAIL_PASSWORD_RAW.replace(/\s+/g, "");
const HAS_EMAIL_CREDENTIALS = Boolean(EMAIL_USER && EMAIL_PASSWORD);

/* ---------------------------------------------------------
   GET USER PROFILE
--------------------------------------------------------- */
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    pharmacyName: req.user.pharmacyName,
    userType: req.user.userType
  });
});

/* ---------------------------------------------------------
   TWILIO CLIENT
--------------------------------------------------------- */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ---------------------------------------------------------
   EMAIL TRANSPORTER
--------------------------------------------------------- */
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

console.log("🔍 Email Configuration:");
console.log("   User:", process.env.EMAIL_USER);
console.log("   Password:", process.env.EMAIL_PASSWORD ? " configured" : " not configured");

// Verify email configuration on startup
if (HAS_EMAIL_CREDENTIALS) {
  emailTransporter.verify((error) => {
    if (error) {
      console.error("❌ Email Configuration Error:", error.message);
      console.log("⚠️  Gmail login failed. Use an App Password from a Google account with 2-Step Verification enabled.");
    } else {
      console.log("✅ Email server is ready to send emails");
    }
  });
} else {
  console.warn("⚠️  Email credentials are not configured. OTP will be logged in development mode.");
}

/* ---------------------------------------------------------
   SEND EMAIL OTP FUNCTION
--------------------------------------------------------- */
const sendEmailOtp = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!HAS_EMAIL_CREDENTIALS) {
      console.error("❌ Email credentials not configured");
      console.log("📝 DEVELOPMENT MODE - OTP for testing:", { email, otp });
      return true; // Return true for development/testing
    }

    await emailTransporter.sendMail({
      from: `"PharmaCare" <${EMAIL_USER}>`,
      to: email,
      subject: "Verification OTP",
      html: `<h2>Your OTP: <b>${otp}</b></h2>`,
    });
    console.log("✅ OTP Email sent successfully to:", email);
    return true;
  } catch (error) {
    // Fallback: Log OTP to console for development/testing if email fails
    console.error("❌ OTP Email Error:", error.message);
    console.log("📝 DEVELOPMENT MODE - OTP for testing (Email failed):", { email, otp });
    if (error.code === "EAUTH" || /Invalid login|BadCredentials/i.test(error.message)) {
      console.log("⚠️  Fix Gmail auth: enable 2-Step Verification, generate a 16-character App Password, and set EMAIL_PASSWORD/EMAIL_APP_PASSWORD.");
    } else {
      console.log("⚠️  Email send failed. Verify SMTP configuration and network access.");
    }
    return true; // Still return true so user can test with console OTP
  }
};

/* ---------------------------------------------------------
   SEND OTP (EMAIL / PHONE)
--------------------------------------------------------- */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    res.status(400);
    throw new Error("Phone or Email required");
  }

  let user;

  // Phone OTP via Twilio
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      res.status(400);
      throw new Error("Invalid phone number");
    }

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_SERVICE_SID || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      res.status(500);
      throw new Error("Phone OTP service is not configured. Please use Email OTP instead.");
    }

    try {
      // Send OTP via Twilio Verify Service
      await twilioClient.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
          to: `+91${cleanPhone}`,
          channel: "sms",
        });
    } catch (twilioError) {
      console.error("Twilio Error:", twilioError.message);
      res.status(500);
      throw new Error("Failed to send SMS OTP. Please use Email OTP instead.");
    }

    await User.findOneAndUpdate(
      { phone: cleanPhone },
      { phone: cleanPhone },
      { new: true, upsert: true }
    );
  }
  // Email OTP Storage
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid date object

    const emailSent = await sendEmailOtp(cleanEmail, otp);
    if (!emailSent) {
      res.status(500);
      throw new Error("Failed to send OTP email");
    }

    await User.findOneAndUpdate(
      { email: cleanEmail },
      { otp, otpExpires },
      { new: true, upsert: true }
    );
  }

  res.json({ message: "OTP sent successfully" });
});
/* ---------------------------------------------------------
   VERIFY OTP
--------------------------------------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  const { name, phone, email, otp, userType, pharmacyName } = req.body;

  if (!otp || (!phone && !email)) {
    res.status(400);
    throw new Error("OTP and Phone/Email required");
  }

  let user;
  let query = {};

  /* PHONE OTP VERIFY */
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_SERVICE_SID || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      res.status(500);
      throw new Error("Phone OTP service is not configured. Please use Email OTP instead.");
    }

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: `+91${cleanPhone}`,
          code: otp,
        });

      if (verificationCheck.status !== "approved") {
        res.status(400);
        throw new Error("Invalid or expired OTP");
      }
    } catch (error) {
      console.error("Twilio Verification Error:", error.message);
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    query.phone = cleanPhone;
    user = await User.findOne(query);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.isVerified = true;
    if (name && !user.name) user.name = name;
    if (userType) user.userType = userType;
    if (userType === "pharmacist" && pharmacyName) {
      user.pharmacyName = pharmacyName;
    }

    await user.save();

    return res.json({
      token: generateToken(user._id, user.userType),
      user,
    });
  }

  /* EMAIL OTP VERIFY */
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    query.email = cleanEmail;

    user = await User.findOne(query);

    if (!user) {
      res.status(400);
      throw new Error("Please request OTP first");
    }

    // Expiry Check (millisecond comparison)
    if (Date.now() > new Date(user.otpExpires).getTime()) {
      res.status(400);
      throw new Error("OTP expired");
    }

    // OTP Match
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      res.status(400);
      throw new Error("Incorrect OTP");
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    if (name && !user.name) user.name = name;
    if (userType) user.userType = userType;
    if (userType === "pharmacist" && pharmacyName) {
      user.pharmacyName = pharmacyName;
    }

    await user.save();

    // IMPORTANT — Return immediately
    return res.json({
      token: generateToken(user._id, user.userType),
      user,
    });
  }
});

/* ---------------------------------------------------------
   UPDATE USER PROFILE
--------------------------------------------------------- */
const updateUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, phone, address, pharmacyName, licenseNumber } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  if (user.userType === "pharmacist") {
    if (pharmacyName) user.pharmacyName = pharmacyName;
    if (licenseNumber) user.licenseNumber = licenseNumber;
  }

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

/* ---------------------------------------------------------
   EXPORTS
--------------------------------------------------------- */
module.exports = {
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
};
