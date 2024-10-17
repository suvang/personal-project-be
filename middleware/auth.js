const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    console.log("reqheader", req.headers);
    // const token = req.headers["authorization"];
    const { token } = req.cookies;

    console.log("token", token);

    if (!token) {
      return res.status(401).json({
        message: "please login first",
      });
    }

    const decoded = await jwt.verify(token, process.env.SECRET);
    console.log("decoded", decoded);

    req.user = await User.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
