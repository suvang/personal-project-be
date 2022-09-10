const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");
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
      if (post.categoryType === "image") {
        const categoryItem = await Category.findById(post.id);
        categoryItem.saved = false;
        await categoryItem.save();
      } else if (post.categoryType === "video") {
        const videoItem = await channelModel.findById(post.id);
        videoItem.saved = false;
        await videoItem.save();
      }

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

      if (post.categoryType === "image") {
        const categoryItem = await Category.findById(post.id);
        categoryItem.saved = true;
        await categoryItem.save();
      } else if (post.categoryType === "video") {
        const videoItem = await channelModel.findById(post.id);
        videoItem.saved = true;
        await videoItem.save();
      }

      const result = await getUserWithPosts(user);

      res.status(201).json({ success: true, data: result, isSaved: false });
    }
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});
