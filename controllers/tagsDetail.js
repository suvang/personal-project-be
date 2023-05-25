const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Tag = require("../models/Tag");

exports.getTags = asyncHandler(async (req, res, next) => {
  try {
    let tags = await Tag.find();
    res.status(200).json(tags);
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});
