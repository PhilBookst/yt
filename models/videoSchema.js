const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const videoSchema = new Schema({
  vidID: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  thumb_url: { type: String },
  formats: { 
    possible: { type: Map, of: String, required: true },
    saved: { type: Map, of: String },
  },
});


const Video = mongoose.model('Video', videoSchema);

module.exports = Video;