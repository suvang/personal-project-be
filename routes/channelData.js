const express = require("express");
const {
  addChannelData,
  getChannelsData,
  updateChannelData,
  updateAllChannelData,
} = require("../controllers/channelData");
const router = express.Router();

router.route("/").post(addChannelData).get(getChannelsData);

router.route("/").put(updateChannelData);

router.route("/all").put(updateAllChannelData);

module.exports = router;
