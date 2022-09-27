const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  publishedAt: String,
  channelId: String,
  title: String,
  description: String,
  deepDescription: String,
  channelTitle: String,
  videoId: String,
  thumbnails: Object,
  videoUrl: String,
  duration: String,
  descriptionImages: {
    type: [String],
  },
  language: {
    name: String,
    color: String,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  popular: Boolean,
  tags: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Channel", ChannelSchema);
