const asyncHandler = require("../middleware/async");
const fetchUserIdNumber = require("../middleware/fetchUserIdNumber");
const User = require("../models/User");
const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");
const getUserWithPosts = require("../middleware/getUserWithPosts");
const jwt = require("jsonwebtoken");
const sendMail = require("../middleware/sendMail");
const Payment = require("../models/Payment");

let numberOfDays = 1 * 24 * 60 * 60 * 1000;

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

    // Lookup payments for the user
    const payments = await Payment.find({ userId: user._id });

    result.payments = payments;

    res.status(200).json({
      success: true,
      data: result,
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

async function addUser(req, res, next) {
  try {
    const { fullName, email, password, email_verified, tokenExpiresAt } =
      req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (req.body.provider === "google") {
      user = await User.create({
        fullName,
        email,
        emailVerified: email_verified ? true : false,
      });
    } else {
      user = await User.create({
        fullName,
        email,
        password,
        emailVerified: email_verified ? true : false,
      });
    }

    console.log("in here", req.body);

    const token = await user.generateToken();

    const options = {
      // expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      expires: tokenExpiresAt
        ? tokenExpiresAt
        : new Date(Date.now() + numberOfDays),
      httpOnly: true,
    };

    const payload = {
      email: user.email,
      id: user._id,
    };

    const emailToken = jwt.sign(payload, "secret123", { expiresIn: "15m" });
    const link = `${process.env.WEB_URL}/profile?id=${user._id}&token=${emailToken}`;

    const content = {
      subjectText: "Verify email",
      message: `Click on the link to verify your account on xplodivity: ${link}`,
    };

    sendMail(user, content);

    res.status(201).cookie("token", token, options).json({
      success: true,
      data: user,
      token,
      expires: options.expires,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//register user
exports.registerUser = asyncHandler(async (req, res, next) => {
  await addUser(req, res, next);
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
    const link = `${process.env.WEB_URL}/explore?id=${user._id}&token=${emailToken}`;

    const content = {
      subjectText: "Verify email",
      message: `Click on the link to verify your account on xplodivity: ${link}`,
    };

    sendMail(user, content);

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
    const { id, token } = req.body;

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
    const { email, password, tokenExpiry } = req.body;

    if (tokenExpiry) req.body.tokenExpiresAt = new Date(tokenExpiry * 1000);

    const { tokenExpiresAt } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (
      user &&
      req.body.provider === "google" &&
      req.body.secret === process.env.SECRET
    ) {
      const token = await user.generateToken();

      const options = {
        // expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        expires: tokenExpiresAt
          ? tokenExpiresAt
          : new Date(Date.now() + numberOfDays),
        httpOnly: false,
        secure: true,
        sameSite: "none",
      };

      return res.status(200).cookie("token", token, options).json({
        success: true,
        data: user,
        token,
        expires: options.expires,
      });
    }

    if (
      !user &&
      req.body.provider === "google" &&
      req.body.secret === process.env.SECRET
    ) {
      return await addUser(req, res, next);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
        userExist: false,
      });
    }

    // const isMatch = await user.matchPassword(password);

    // if (!isMatch) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "incorrect password",
    //     userExist: true,
    //   });
    // }

    let isMatch;
    if (req.body.provider !== "google") {
      isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "incorrect password",
          userExist: true,
        });
      }
    }

    const token = await user.generateToken();

    const options = {
      // expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      expires: tokenExpiresAt
        ? tokenExpiresAt
        : new Date(Date.now() + numberOfDays),
      httpOnly: false,
      secure: true,
      sameSite: "none",
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      data: user,
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

    const content = {
      subjectText: "Reset password",
      message: `Click on the link to reset your password: ${link}`,
    };

    sendMail(user, content);

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
