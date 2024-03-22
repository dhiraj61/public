const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  course: String,
  address: String,
  img: String,
});

module.exports = mongoose.model("student", studentSchema);
