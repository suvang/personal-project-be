const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/Allcategories");
const fetchIdNumber = require("../middleware/fetchIdNumber");
const User = require("../models/User");
const { pagination } = require("../middleware/pagination");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const Tag = require("../models/Tag");

//youtube config
const apiKey = "AIzaSyAzDClJ05OqsIU-EsTZhaG6BoEaCjeojCM";
const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

//desc    get all categories
//route   GET /api/v1/allcategories
//access  public
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  let category = await pagination(
    req,
    res,
    next,
    Category,
    (type = "allcategory")
  );

  res.status(200).json(category);
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
    image: req?.files[0]?.path,
    blogUrl: `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}/${
      requestBody.blogUrl
    }`,
    // totalChapters: requestBody.chapters.length,
    owner: req.user._id,
  });
  let user = await User.findById(req.user._id);

  if (!user) {
    res.status(400).json({ success: false, data: "user not defined" });
  }

  // if (requestBody.categoryType === "audio") {
  //   for (let i in requestBody.chapters) {
  //     Object.assign(requestBody.chapters[i], { chapterAudioSrc: "" });
  //   }

  //   for (let i in req.files) {
  //     if (req.files[i].fieldname !== "image") {
  //       const getFieldName = parseInt(req.files[i].fieldname);
  //       requestBody.chapters[getFieldName - 1].chapterAudioSrc =
  //         req.files[i].path;
  //     }
  //   }
  // }

  // if (requestBody.categoryType === "image") {
  //   for (let i in requestBody.chapters) {
  //     Object.assign(requestBody.chapters[i], { subImages: [], totalImages: 0 });
  //   }

  //   for (let i in req.files) {
  //     if (req.files[i].fieldname !== "image") {
  //       const getFieldName = parseInt(req.files[i].fieldname);
  //       requestBody.chapters[getFieldName - 1].subImages.push(
  //         req.files[i].path
  //       );
  //       requestBody.chapters[getFieldName - 1].totalImages++;
  //     }
  //   }
  // }

  if (requestBody.categoryType === "image") {
    requestBody.descriptionImages = [];
    for (let i in req.files) {
      if (req.files[i].fieldname !== "coverImage") {
        requestBody.descriptionImages.push(req.files[i].path);
      }
    }
  }

  if (requestBody.categoryType === "video") {
    // send these properties from frontend in req.body.finalObj
    // description;
    // videoId: data.id;
    // categoryType: "video";
    // popular;
    let { videoId } = JSON.parse(req.body.finalObj);

    const videoContentDetails = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${apiKey}`
    );

    const descriptionImages = [];

    for (let i in req.files) {
      const getFieldName = parseInt(req.files[i].fieldname);
      descriptionImages[getFieldName - 1] = req.files[i].path;
    }

    const data = videoContentDetails.data.items[0];

    requestBody.publishedAt = data.snippet.publishedAt;
    requestBody.channelId = data.snippet.channelId;
    requestBody.topicName = data.snippet.title;
    requestBody.channelTitle = data.snippet.channelTitle;
    requestBody.thumbnails = data.snippet.thumbnails;
    requestBody.descriptionImages = descriptionImages;
    requestBody.videoUrl = `https://www.youtube.com/embed/${requestBody.videoId}`;
    requestBody.duration = data.contentDetails.duration;
  }

  let categoryItem = await Category.create(requestBody);

  if (!categoryItem) {
    res.status(400).json({ success: false, data: "categoryItem not defined" });
    return;
  }

  res.status(201).json({ success: true, data: categoryItem });

  for (let i = 0; i < requestBody.tags.length; i++) {
    const doesTagExist = await Tag.findOne({ name: requestBody.tags[i] });
    if (!doesTagExist) {
      await Tag.create({ name: requestBody.tags[i] });
    }
  }
});

//desc get single category
//route GET /api/v1/allcategories/:id
//access public
exports.getCategory = asyncHandler(async (req, res, next) => {
  // req.params.id
  console.log("req.params.name ", req.params.name);
  const category = await Category.find({ topicName: req.params.name });

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
  // await Category.findOneAndUpdate({ _id: req.params.id }, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  const { id } = req.query;

  const category = await Category.findById(id);
  const reqBodyKey = Object.keys(req.body)[0];
  const items = reqBodyKey.split(".");
  category[items[0]][Number(items[1])][items[2]] = req.body[reqBodyKey];
  category.save();

  res.status(200).json({ success: true, data: category });
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
