const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PricePackSchema = require("../sharedSchemas/pricePack");

const UserSchema = new mongoose.Schema({
  id: Number,
  fullName: {
    type: String,
    // required: [true, "Please add a full name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  about: {
    type: String,
  },
  // savedPosts: [{ type: mongoose.Schema.Types.ObjectId, refPath: "onModel" }],
  savedPosts: [{ id: String, categoryType: String }],
  highlightedStories: [
    { type: mongoose.Schema.Types.ObjectId, refPath: "onModel" },
  ],
  onModel: {
    type: String,
    enum: ["Channel", "AllCategories"],
  },
  password: {
    type: String,
    // required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordLink: String,
  emailVerified: { type: Boolean, default: false },
  purchasedCourses: [
    {
      courseId: mongoose.Schema.Types.ObjectId,
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: Date,
      pricePack: PricePackSchema,
    },
  ],
  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.SECRET);
};

module.exports = mongoose.model("User", UserSchema);
