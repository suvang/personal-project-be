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
      };
    });

    const videos = await channelModel.find({});

    let set = new Set();

    videos.forEach((video) => set.add(video.id));

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

exports.getChannelData = asyncHandler(async (req, res, next) => {
  try {
    const videos = await channelModel.find({}).populate("question");

    // await questionModel.create(questiondata);
    // console.log("videos", videos);
    //delete all
    // await channelModel.deleteMany({}, () => {});

    res.status(201).json({ success: true, data: videos });
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});

exports.updateChannelData = asyncHandler(async (req, res, next) => {
  try {
    const { questionId, question_id } = req.query;
    const video = await channelModel.findOne({ id: questionId });

    video.question = question_id;

    await video.save();

    res.status(201).json({ success: true, data: video });
  } catch (err) {
    console.log("videos", err);
    res.status(400).json({ success: false, data: err });
  }
});
