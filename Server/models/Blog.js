const mongoose = require("mongoose");

// Schema blog
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: { type: String }, 
  content: { type: String }, 
  category: { type: String },
  thumbnail: { type: String }, 
  published: { type: Boolean, default: false }
}, { timestamps: true }); 

module.exports = mongoose.model("Blog", blogSchema); 
