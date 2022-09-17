const asyncHandler = require("../middleware/async");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const channelModel = require("../models/Channel");
const questionModel = require("../models/Question");
const { pagination } = require("../middleware/pagination");
//youtube config
const apiKey = "AIzaSyAzDClJ05OqsIU-EsTZhaG6BoEaCjeojCM";
const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

//desc    get youtube channel details for xplodivity
//route   POST /api/v1/channeldata
//access  public
exports.addChannelData = asyncHandler(async (req, res, next) => {
  try {
    const { videoId, language, deepDescription, popular } = req.body;

    const videoContentDetails = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${apiKey}`
    );

    const data = videoContentDetails.data.items[0];
    const finalData = {
      publishedAt: data.snippet.publishedAt,
      channelId: data.snippet.channelId,
      title: data.snippet.title,
      description: data.snippet.description,
      deepDescription,
      channelTitle: data.snippet.channelTitle,
      videoId: data.id,
      categoryType: "video",
      thumbnails: data.snippet.thumbnails,
      language,
      popular,
      videoUrl: `https://www.youtube.com/watch?v=${data.id}`,
      duration: data.contentDetails.duration,
    };

    await channelModel.create(finalData);

    console.log("finalData", finalData);

    res.status(201).json({ success: true, data: finalData });
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});

exports.getChannelsData = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.query;
    let videoData;
    if (id) {
      videoData = await channelModel.findById(id);
      res.status(200).json({ success: true, data: videoData });
      return;
    }

    videoData = await pagination(req, res, next, channelModel);
    res.status(200).json(videoData);

    //delete all
    // await channelModel.deleteMany({}, () => {});
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});

exports.updateChannelData = asyncHandler(async (req, res, next) => {
  try {
    const { id, question_id } = req.query;
    const { postContent } = req.body;

    console.log("postcontent", postContent);
    const video = await channelModel.findOne({ id });

    if (question_id) {
      video.question = question_id;
    }

    if (postContent) {
      video.deepDescription = postContent;
    }

    await video.save();

    res.status(201).json({ success: true, data: video });
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});

//updating all duration case
exports.updateAllChannelData = asyncHandler(async (req, res, next) => {
  try {
    const videos = await channelModel.find({});

    videos.forEach(async (video) => {
      if (
        video.title.toLowerCase().includes("javascript") &&
        !video.title.toLowerCase().includes("react")
      ) {
        video.language = {
          name: "JavaScript",
          color: "#ffe83b",
        };

        await video.save();
      }
    });

    // let videoIdSet = new Set();

    // videos.forEach((video) => videoIdSet.add(video.videoId));

    // const videoIds = [...videoIdSet];
    // const videoContentDetails = await axios.get(
    //   `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${apiKey}`
    // );

    // videos.forEach(async (video) => {
    //   const vid = await channelModel.findOne({ id: video.id });
    //   vid.duration = videoContentDetails.data.items.find(
    //     (content) => content.id === vid.videoId
    //   ).contentDetails.duration;

    //   await vid.save();
    // });

    res.status(201).json({ success: true, data: videos });
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});
