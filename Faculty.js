const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  experience: String,
  address: String,
  img: String,
});

module.exports = mongoose.model("Faculty", facultySchema);
