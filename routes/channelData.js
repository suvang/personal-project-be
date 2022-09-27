const express = require("express");
const {
  addChannelData,
  getChannelsData,
  updateChannelData,
  updateAllChannelData,
} = require("../controllers/channelData");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    dir = `./uploads/videos/${req.body.videoId}`;
    if (!fs.existsSync(dir)) {
      await fs.mkdirSync(dir);
      cb(null, dir);
      return;
    }
    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
    fileFilter: fileFilter,
  },
  preservePath: true,
});

const type = upload.any();

router.route("/").post(type, addChannelData).get(getChannelsData);

router.route("/").put(updateChannelData);

router.route("/all").put(updateAllChannelData);

module.exports = router;
