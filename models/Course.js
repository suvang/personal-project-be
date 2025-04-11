const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  courseName: String,
  url: String,
  price: Number,
  fullPrice: Number,
  discount: String,
  tags: {
    type: [String],
  },
  thumbnail: {
    type: String,
  },
  pricePacks: [
    {
      accessYears: {
        type: Number,
        required: true,
      },
      accessYearsText: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      fullPrice: {
        type: Number,
        required: true,
      },
      discount: {
        type: String,
        required: true,
      },
    },
  ],
  courseContent: [
    {
      id: Number,
      videoName: String,
      thumbnail: String,
      sourceCode: String,
      videoUrl: String,
      duration: String,
    },
  ],
  topDescription: {
    type: String,
    required: true,
  },
  bottomDescription: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CourseSchema.methods.generateId = function () {
  return this._id;
};

module.exports = mongoose.model("Course", CourseSchema);
