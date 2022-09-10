const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  id: String,
  publishedAt: String,
  channelId: String,
  title: String,
  description: String,
  deepDescription: String,
  channelTitle: String,
  playlistId: String,
  videoId: String,
  thumbnails: Object,
  videoUrl: String,
  duration: String,
  saved: {
    type: Boolean,
    default: false,
  },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Channel", ChannelSchema);
