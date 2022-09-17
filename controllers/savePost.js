const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const getUserWithPosts = require("../middleware/getUserWithPosts");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.savePost = asyncHandler(async (req, res, next) => {
  const { postId, type } = req.query;
  let user = await User.findById(req.user._id);

  try {
    const post = {
      id: postId,
      categoryType: type,
    };

    const isExist = user.savedPosts.find(
      (item) => item.id === post.id && item.categoryType === post.categoryType
    );

    if (isExist) {
      const index = user.savedPosts.findIndex(
        (item) => item.id === post.id && item.categoryType === post.categoryType
      );

      user.savedPosts.splice(index, 1);
      await user.save();

      const result = await getUserWithPosts(user);

      res.status(201).json({ success: true, data: result, isSaved: true });
    } else {
      user.savedPosts.push(post);
      await user.save();

      const result = await getUserWithPosts(user);

      res.status(201).json({ success: true, data: result, isSaved: false });
    }
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});
