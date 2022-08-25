const express = require("express");
const {
  getAllUsers,
  getUser,
  registerUser,
  loginUser,
  updateUser,
  logout,
  deleteMyProfile,
} = require("../controllers/userDetails");
const router = express.Router();
const multer = require("multer");
const { isAuthenticated } = require("../middleware/auth");
const upload = multer();

const type = upload.none();

router.route("/getallusers").get(getAllUsers);

router.route("/currentuser").get(isAuthenticated, getUser);

router.route("/register").post(type, registerUser);

router.route("/updateuser").put(isAuthenticated, updateUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

router.route("/deleteprofile").delete(isAuthenticated, deleteMyProfile);

module.exports = router;
