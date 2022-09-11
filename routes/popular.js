const express = require("express");
const { getPopular } = require("../controllers/popular");
const router = express.Router();

router.route("/").get(getPopular);

module.exports = router;
