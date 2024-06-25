const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder, paymentVerification } = require("../controllers/payment");
const router = express.Router();

router.route("/order").post(isAuthenticated, createOrder);
router.route("/paymentverification").post(isAuthenticated, paymentVerification);

module.exports = router;
