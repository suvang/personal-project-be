const asyncHandler = require("../middleware/async");
const fetchUserIdNumber = require("../middleware/fetchUserIdNumber");
const User = require("../models/User");
const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");
const getUserWithPosts = require("../middleware/getUserWithPosts");
const jwt = require("jsonwebtoken");
const sendMail = require("../middleware/sendMail");

//get all users
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find({})
      .populate({
        path: "posts",
        model: "AllCategories",
      })
      .populate({ path: "highlightedStories", model: "AllCategories" })
      .populate({ path: "savedPosts", model: "AllCategories" });

    res.status(200).json({
      success: true,
      count: user.length,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const result = await getUserWithPosts(user);

    res.status(200).json({
      success: true,
      user: result,
    });
  } catch (error) {
    res.json({ status: "error", error: "invalid token" });
  }
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    let requestBody = { ...req.body };

    if (!requestBody) {
      res.status(400).json({
        success: false,
        message: "no data provided",
      });
    }

    let user = await User.findById(req.user._id).select("+password");

    // if (requestBody.email) user.email = requestBody.email;

    if (requestBody.fullName) user.fullName = requestBody.fullName;

    // if (requestBody.about) user.about = requestBody.about;

    if (requestBody.currentPassword && requestBody.newPassword) {
      const { currentPassword, newPassword } = req.body;

      const isMatch = await user.matchPassword(currentPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Old password",
          isCurrentPasswordValid: false,
        });
      }

      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//register user
exports.registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    user = await User.create({
      fullName,
      email,
      password,
      id: await fetchUserIdNumber(),
      emailVerified: false,
    });

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    const payload = {
      email: user.email,
      id: user._id,
    };

    const emailToken = jwt.sign(payload, "secret123", { expiresIn: "15m" });
    const link = `${process.env.WEB_URL}/stories/popular?id=${user._id}&token=${emailToken}`;

    sendMail(user, link, "email");

    res.status(201).cookie("token", token, options).json({
      success: true,
      user,
      token,
      expires: options.expires,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.sendMailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(201).json({
        success: false,
        message: "Invalid user id",
      });
      return;
    }

    const payload = {
      email: user.email,
      id: user._id,
    };

    const emailToken = jwt.sign(payload, "secret123", { expiresIn: "15m" });
    const link = `${process.env.WEB_URL}/stories/popular?id=${user._id}&token=${emailToken}`;

    sendMail(user, link, "email");

    res.status(200).json({
      success: true,
      message: "Verification email sent to verify email",
      emailSent: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      emailVerified: false,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { id, token } = req.query;

    const user = await User.findById(id);

    if (!user) {
      res.status(201).json({
        success: false,
        message: "Invalid user id",
      });
      return;
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: "Your email has already been verified.",
        emailVerified: true,
      });
    }

    jwt.verify(token, "secret123");

    user.emailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Your email is verified",
      emailVerified: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      emailVerified: false,
    });
  }
};

//login user
exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
        userExist: false,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "incorrect password",
        userExist: true,
      });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: false,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
      expires: options.expires,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.logout = asyncHandler(async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({ success: true, messge: "Logged out" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    await user.remove();

    //Logout user after deleting profile
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(200).json({
        success: false,
        message: "user does not exist",
        emailFound: false,
      });
      return;
    }

    const payload = {
      email: user.email,
      id: user._id,
    };

    const token = jwt.sign(payload, "secret123", { expiresIn: "15m" });
    const link = `${process.env.WEB_URL}/reset-password?id=${user._id}&token=${token}`;

    sendMail(user, link, "password");

    user.resetPasswordLink = link;
    user.save();

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
      emailFound: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id, token } = req.query;
    const { password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(201).json({
        success: false,
        message: "Invalid user id",
      });
      return;
    }

    if (!user.resetPasswordLink) {
      res.status(201).json({
        success: false,
        message: "You have already reset your password using this link",
        verified: false,
      });
      return;
    }

    jwt.verify(token, "secret123");

    if (password) {
      user.password = password;
      user.resetPasswordLink = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: "password has been reset",
        reset: true,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "token verified to reset password",
      verified: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      verified: false,
    });
  }
};
