const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");

exports.getAllCourses = asyncHandler(async (req, res, next) => {
  let courses = await Course.find({});
  res.status(200).json(courses);
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.find({ url: req.params.url });
  res.status(200).json(course);
});
