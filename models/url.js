const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true,
  },
  redirectURL: {
    type: String,
  },
});

const urlModel = mongoose.model("urls", urlSchema);

module.exports = urlModel;
