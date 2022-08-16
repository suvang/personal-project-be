const express = require("express");
const {
  addChannelData,
  getChannelData,
  updateChannelData,
} = require("../controllers/channelData");
const router = express.Router();

router.route("/").post(addChannelData).get(getChannelData);
router.route("/").put(updateChannelData);

module.exports = router;
