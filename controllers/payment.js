const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Payment = require("../models/Payment");
const getUserWithPosts = require("../middleware/getUserWithPosts");
const Razorpay = require("razorpay");
const {
  validatePaymentVerification,
} = require("../node_modules/razorpay/dist/utils/razorpay-utils");
const sendMail = require("../middleware/sendMail");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.createOrder = asyncHandler(async (req, res, next) => {
  console.log("req.body", req.body);

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  instance.orders.create(
    {
      amount: req.body.amount,
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

exports.paymentVerification = asyncHandler(async (req, res, next) => {
  // console.log("req.body", req.body);
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
    userId,
    courseId,
    orderId,
    courseName,
    courseUrl,
  } = req.body;

  const isAuthentic = validatePaymentVerification(
    { order_id: orderId, payment_id: razorpay_payment_id },
    razorpay_signature,
    process.env.RAZORPAY_KEY_SECRET
  );

  if (isAuthentic) {
    const purchaseDate = new Date();

    let courseDetails = {
      courseId,
      purchaseDate: purchaseDate,
      expiresAt: new Date(purchaseDate).setFullYear(
        new Date(purchaseDate).getFullYear() + 1
      ),
    };

    let user = await User.findById(req.user._id);
    await Payment.create({
      email,
      userId,
      courseId,
      courseDetails,
      paymentInfo: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });

    user.purchasedCourses.push(courseDetails);
    await user.save();

    const content = {
      subjectText: "Confirmation of Your Course Purchase – Welcome Aboard!",
      message: `${
        user?.fullName ? `Dear ${user?.fullName}` : "Hello"
      },\n\nThank you for purchasing ${courseName}! We're thrilled to have you on board and excited for you to start your learning journey with us.\n\nYou can now access the course through your account at ${courseUrl}. If you have any questions or need assistance, feel free to reach out.\n\nHappy learning!\n\nBest regards,\nXplodivity`,
    };

    sendMail(user, content);

    res.status(200).json({
      success: true,
    });
  } else {
    res.status(400).json({
      success: false,
    });
  }
});
