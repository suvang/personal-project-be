const mongoose = require("mongoose");
const slugify = require("slugify");

const AllCategoriesSchema = new mongoose.Schema({
  id: Number,
  categoryType: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["audio", "image", "text"],
  },
  image: {
    type: String,
    // default: "no-photo.jpg",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  comments: [
    {
      writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      writerName: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      // responseTo: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      // },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  slug: String,

  storyName: {
    type: String,
    required: true,
  },

  uniqueTrackingNo: String,
  totalChapters: {
    type: Number,
    required: true,
  },

  storyTags: {
    type: [String],
    required: true,
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

module.exports = mongoose.model("AllCategories", AllCategoriesSchema);
