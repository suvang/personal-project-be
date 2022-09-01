const asyncHandler = require("../middleware/async");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const channelModel = require("../models/Channel");
const questionModel = require("../models/Question");
const questiondata = require("../_data/questionsData.json");
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
    const response = await youtube.channels.list({
      part: "contentDetails",
      id: "UCQ_TmFbOkCyIfknGonSXEVQ",
    });

    const uploadId =
      response.data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadId}&key=${apiKey}&part=snippet&maxResults=50`
    );

    const channelData = data.data.items;

    const videos = await channelModel.find({});

    let set = new Set();

    videos.forEach((video) => set.add(video.id));

    let videoIdSet = new Set();

    videos.forEach((video) => videoIdSet.add(video.videoId));

    const videoIds = [...videoIdSet];
    const videoContentDetails = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${apiKey}`
    );

    // console.log("videoContentDetails", videoContentDetails.data.items);

    const finalData = channelData.map((item) => {
      return {
        id: item.id,
        publishedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        playlistId: item.snippet.playlistId,
        videoId: item.snippet.resourceId.videoId,
        thumbnails: item.snippet.thumbnails,
        videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        duration: videoContentDetails.data.items.find(
          (content) => content.id === item.snippet.resourceId.videoId
        ).contentDetails.duration,
      };
    });

    for (let i = 0; i < finalData.length; i++) {
      if (!set.has(finalData[i].id)) {
        await channelModel.create(finalData[i]);
      }
    }

    res.status(201).json({ success: true, data: finalData });
  } catch (err) {
    res.status(400).json({ success: false, data: err });
  }
});

exports.getChannelsData = asyncHandler(async (req, res, next) => {
  try {
    let videoData;
    const { id } = req.query;

    if (id) {
      videoData = await channelModel.find({ id }).populate("question");
      res.status(201).json({ success: true, data: videoData[0] });
      return;
    } else {
      videoData = await channelModel.find({}).populate("question");
      res.status(201).json({ success: true, data: videoData });
      return;
    }

    // await questionModel.create(questiondata);
    // console.log("videos", videos);
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

    let videoIdSet = new Set();

    videos.forEach((video) => videoIdSet.add(video.videoId));

    const videoIds = [...videoIdSet];
    const videoContentDetails = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${apiKey}`
    );

    videos.forEach(async (video) => {
      const vid = await channelModel.findOne({ id: video.id });
      vid.duration = videoContentDetails.data.items.find(
        (content) => content.id === vid.videoId
      ).contentDetails.duration;

      await vid.save();
    });

    res.status(201).json({ success: true, data: videos });
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});
