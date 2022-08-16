const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
  },
  questions: [
    {
      questionNumber: Number,
      question: String,
      options: [String],
      answer: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
