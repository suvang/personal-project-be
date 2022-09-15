const asyncHandler = require("../middleware/async");
const fetchUserIdNumber = require("../middleware/fetchUserIdNumber");
const User = require("../models/User");
const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");
const getUserWithPosts = require("../middleware/getUserWithPosts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
    let user = await User.findById(req.user._id).select("+password");

    if (requestBody.email) user.email = requestBody.email;

    if (requestBody.username) user.username = requestBody.username;

    if (requestBody.about) user.about = requestBody.about;

    if (requestBody.newPassword) {
      const { oldPassword, newPassword } = req.body;
      const isMatch = await user.matchPassword(oldPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Old password",
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
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    user = await User.create({
      username,
      email,
      password,
      id: await fetchUserIdNumber(),
    });

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//login user
exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
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

    const secret = "secret123" + user.password;
    const payload = {
      email: user.email,
      id: user._id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:3000/reset-password?id=${user._id}&token=${token}`;

    const log = console.log;

    // Step 1
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL, // TODO: your gmail account
        pass: process.env.PASSWORD, // TODO: your gmail password
      },
    });

    // Step 2
    let mailOptions = {
      from: "xplodivity.mail@gmail.com", // TODO: email sender
      to: `${user.email}`, // TODO: email receiver
      subject: "Reset password",
      text: `Click on the link to reset your password ${link}`,
    };

    // Step 3
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        return log("Error occurs");
      }
      return log("Email sent!!!");
    });

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

    const secret = "secret123" + user.password;

    jwt.verify(token, secret);

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
