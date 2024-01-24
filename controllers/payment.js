const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const getUserWithPosts = require("../middleware/getUserWithPosts");
const Razorpay = require("razorpay");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const instance = new Razorpay({
    key_id: "rzp_test_HwwK3yQRnEOlhI",
    key_secret: "TqCi3i52A4a7cfItRmo4fRrn",
  });

  instance.orders.create(
    {
      amount: 50000,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        key1: "value3",
        key2: "value2",
      },
    },
    (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
    }
  );
});
