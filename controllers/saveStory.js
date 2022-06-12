const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.saveStory = asyncHandler(async (req, res, next) => {
  const postId = req.body.id;
  let user = await User.findById(req.user._id);

  try {
    user.savedStories.push(postId);
    await user.save();
    res.status(201).json({ success: true, data: req.body });
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});
