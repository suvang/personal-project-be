const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/Allcategories");
const fetchIdNumber = require("../middleware/fetchIdNumber");
const User = require("../models/User");

//desc    get all categories
//route   GET /api/v1/allcategories
//access  public
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  //fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //loop over removeFields and delete the reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  console.log("reqQuery", reqQuery);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  //create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //Finding resource
  query = Category.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 2;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Category.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing query
  const category = await query;

  //pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: category.length,
    pagination: pagination,
    data: category,
  });
});

//desc    add to all categories
//route   POST /api/v1/allcategories
//access  private
exports.addCategory = asyncHandler(async (req, res, next) => {
  let requestBody = JSON.parse(req.body.finalObj);
  console.log("reqfronendbody", JSON.parse(req.body.finalObj));

  Object.assign(requestBody, {
    uniqueTrackingNo: String(new Date().getTime()).concat(
      Math.random().toString(36).slice(2)
    ),
    id: await fetchIdNumber(),
    image: req.files[0].path,
    totalChapters: requestBody.chapters.length,
    owner: req.user._id,
  });
  let user = await User.findById(req.user._id);

  if (!user) {
    res.status(400).json({ success: false, data: "user not defined" });
  }

  if (requestBody.categoryType === "audio") {
    for (let i in requestBody.chapters) {
      Object.assign(requestBody.chapters[i], { chapterAudioSrc: "" });
    }

    for (let i in req.files) {
      if (req.files[i].fieldname !== "image") {
        const getFieldName = parseInt(req.files[i].fieldname);
        requestBody.chapters[getFieldName - 1].chapterAudioSrc =
          req.files[i].path;
      }
    }
  }

  if (requestBody.categoryType === "image") {
    for (let i in requestBody.chapters) {
      Object.assign(requestBody.chapters[i], { subImages: [], totalImages: 0 });
    }

    for (let i in req.files) {
      if (req.files[i].fieldname !== "image") {
        const getFieldName = parseInt(req.files[i].fieldname);
        requestBody.chapters[getFieldName - 1].subImages.push(
          req.files[i].path
        );
        requestBody.chapters[getFieldName - 1].totalImages++;
      }
    }
  }

  let categoryItem = await Category.create(requestBody);

  if (!categoryItem) {
    res.status(400).json({ success: false, data: "categoryItem not defined" });
    return;
  }

  user.posts.push(categoryItem._id);

  await user.save();
  res.status(201).json({ success: true, data: categoryItem });
});

//desc get single category
//route GET /api/v1/allcategories/:id
//access public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: category });
});

//desc Update a category
//route PUT /api/v1/allcategories/:id
//access private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  await Category.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });

  // if (!category) {
  //   return next(
  //     new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
  //   );
  // }

  // res.status(200).json({ success: true, data: category });
});

//desc Delete a category
//route DELETE /api/v1/allcategories/:id
//access private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  console.log("delete", req.params);
  try {
    const post = await Category.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await post.remove();

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    await user.save();

    res.status(500).json({
      success: false,
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.likeAndUnlikePost = asyncHandler(async (req, res) => {
  try {
    const post = await Category.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index, 1);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      post.likes.push(req.user._id);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.getPostOfFollowing = asyncHandler(async (req, res) => {
  console.log("user getposofffollowing", req.user);
  try {
    const user = await User.findById(req.user._id);

    const posts = await Category.find({
      owner: {
        $in: user.following,
      },
    });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.addComment = async (req, res) => {
  try {
    const post = await Category.findById(req.params.id);
    const { parentId, writerName } = req.body;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      writer: req.user._id,
      writerName,
      comment: req.body.comment,
      parentId,
    });

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const post = await Category.findById(req.params.id);
    let commentIndex = -1;
    let commentId = req.body.commentId;

    //Checking if comment already exists
    post.comments.forEach((item, index) => {
      if (
        item.writer.toString() === req.user._id.toString() &&
        item._id.toString() === commentId.toString()
      ) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
