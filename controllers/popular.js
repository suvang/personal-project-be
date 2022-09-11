const asyncHandler = require("../middleware/async");
const channelModel = require("../models/Channel");
const Category = require("../models/Allcategories");
const { pagination } = require("../middleware/pagination");

//desc    adds a highlighted story id to the user
//route   POST /api/v1/addHighlightedStory
//access  private
exports.getPopular = asyncHandler(async (req, res, next) => {
  try {
    // let category = await Category.find({ popular: true });
    // let videos = await channelModel.find({ popular: true });

    // const finalData = [...category, ...videos].sort((a, b) =>
    //   a.createdAt > b.createdAt ? 1 : -1
    // );

    const finalData = await pagination(
      req,
      res,
      next,
      [Category, channelModel],
      (type = "popular")
    );

    res.status(201).json(finalData);
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});
