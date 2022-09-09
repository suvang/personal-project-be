const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.savePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.query;
  let user = await User.findById(req.user._id);

  try {
    user.savedPosts.push(postId);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});