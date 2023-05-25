const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Tag", TagSchema);
