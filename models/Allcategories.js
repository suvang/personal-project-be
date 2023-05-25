const mongoose = require("mongoose");
const slugify = require("slugify");

const AllCategoriesSchema = new mongoose.Schema({
  id: Number,
  categoryType: {
    type: String,
    required: [true, "Please add a category"],
  },
  image: {
    type: String,
    // default: "no-photo.jpg",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  slug: String,

  topicName: {
    type: String,
    required: true,
  },

  uniqueTrackingNo: String,
  totalChapters: {
    type: Number,
    // required: true,
  },
  headings: {
    type: [String],
  },
  tags: {
    type: [String],
    required: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: true,
  },
  descriptionImages: {
    type: [String],
  },
  blogUrl: {
    type: String,
  },
  chapters: [
    {
      chapterNumber: Number,
      totalImages: Number,
      subImages: {
        type: [String],
      },
      chapterAudioSrc: String,
      chapterName: String,
      chapterDescription: String,
    },
  ],
  popular: Boolean,
  videoId: String,
  thumbnails: Object,
  videoUrl: String,
  duration: String,
  publishedAt: String,
  channelId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//create category slug from
// AllCategoriesSchema.pre("save", function (next) {
//   this.slug = slugify(this.categoryType, { lower: true });
//   next();
// });

AllCategoriesSchema.methods.generateId = function () {
  return this._id;
};

module.exports = mongoose.model("AllCategories", AllCategoriesSchema);
