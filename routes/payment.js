const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder, paymentVerification } = require("../controllers/payment");
const router = express.Router();

router.route("/order").post(createOrder);
router.route("/paymentverification").post(paymentVerification);

module.exports = router;
