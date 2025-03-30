const express = require("express");
const {
  getAllUsers,
  getUser,
  registerUser,
  loginUser,
  updateUser,
  logout,
  deleteMyProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendMailVerification,
  sendBulkEmail,
} = require("../controllers/userDetails");
const router = express.Router();
const multer = require("multer");
const { isAuthenticated } = require("../middleware/auth");
const upload = multer();

const type = upload.none();

router.route("/getallusers").get(isAuthenticated, getAllUsers);

router.route("/currentuser").get(isAuthenticated, getUser);

router.route("/register").post(type, registerUser);

router.route("/updateuser").put(isAuthenticated, updateUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

router.route("/forgot-password").post(forgotPassword);

router.route("/verify-email").put(verifyEmail);

router.route("/reset-password").get(resetPassword).post(resetPassword);

router
  .route("/resend-email-verification")
  .get(isAuthenticated, sendMailVerification);

router.route("/send-bulk-email").get(sendBulkEmail);

router.route("/deleteprofile").delete(isAuthenticated, deleteMyProfile);

module.exports = router;
