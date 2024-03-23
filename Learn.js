const mongoose = require("mongoose");

const learnSchema = new mongoose.Schema({
  learn: String,
});

module.exports = mongoose.model("learn", learnSchema);
