const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  paymentInfo: {
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PaymentSchema.methods.generateId = function () {
  return this._id;
};

module.exports = mongoose.model("Payment", PaymentSchema);
