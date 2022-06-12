const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { saveStory } = require("../controllers/saveStory");
const router = express.Router();

router.route("/").post(isAuthenticated, saveStory);

module.exports = router;
