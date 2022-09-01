const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { savePost } = require("../controllers/savePost");
const router = express.Router();

router.route("/").post(isAuthenticated, savePost);

module.exports = router;
