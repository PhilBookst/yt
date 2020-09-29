const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  thumb_url: { type: String },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;