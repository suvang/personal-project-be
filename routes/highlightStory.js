const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { addHighlightedStory } = require("../controllers/highlightStory");
const router = express.Router();

router.route("/").post(isAuthenticated, addHighlightedStory);

module.exports = router;
