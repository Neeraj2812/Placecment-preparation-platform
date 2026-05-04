const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  category: String,
  company: String,
  question: String,
  answer: String,
  difficulty: String
});

module.exports = mongoose.model("Question", questionSchema);