const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");

exports.getCourses = asyncHandler(async (req, res, next) => {
  const { url } = req.query;
  let data;

  if (url) {
    data = await Course.findOne({ url });
    console.log("data", data);
  } else {
    data = await Course.find({});
  }

  res.status(200).json(data);
});
