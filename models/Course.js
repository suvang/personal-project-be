const mongoose = require("mongoose");
const PricePackSchema = require("../sharedSchemas/pricePack");

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
  pricePacks: [PricePackSchema],
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
