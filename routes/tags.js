const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { getTags } = require("../controllers/tagsDetail");
const router = express.Router();

router.route("/").get(isAuthenticated, getTags);

module.exports = router;
