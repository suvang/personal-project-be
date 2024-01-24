const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder } = require("../controllers/payment");
const router = express.Router();

router.route("/order").post(createOrder);

module.exports = router;
