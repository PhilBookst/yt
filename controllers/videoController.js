const ytdl = require('ytdl-core');
const fs = require('fs');
const Video = require('../models/videoSchema');


exports.download = (req, res, next) => {
  let { _id } = req.params;
  let { format, title } = req.query;

  title = decodeURIComponent(title);
  format = decodeURIComponent(format);

  return res.download(`${_id}.${format}`, `${title}.${format}`);
}

exports.videoSubmit = async (req, res, next) => {

  try {
    
    const { url } = req.body;
  
    if(!ytdl.validateURL(url)) res.render('index', { error: 'Not a valid URL' });

    const _id = await ytdl.getURLVideoID(url);

    // Search DB for Video ID
    const video = await Video.findOne({ _id }).exec();

    if(video) {

      const { title, author, thumb_url } = video;
      const qualities = await getQualities(_id);
  
      return res.render('video', { 
        _id, 
        title, 
        author, 
        thumb_url,  
        qualities, 
        formats: ['mp3', 'mp4'],
      });

    } else {

      console.log(_id);

      let { videoDetails, formats } = await ytdl.getBasicInfo(url);
      let { author, title, thumbnail} = videoDetails;

      console.log(formats);

      let thumb_url = thumbnail.thumbnails.slice(-1)[0].url;
      const iframe = `https://www.youtube.com/embed/${_id}`;

      const selection = new Map();
    
      formats.reduceRight((prev, curr) => {
        if(curr.qualityLabel && curr.mimeType.includes('mp4') && !selection.has(curr.qualityLabel)) selection.set(curr.qualityLabel, curr.itag);
        return prev;
      });
    
      const qualities = [... selection.keys()];
    
      const video = new Video({
        _id,
        title,
        author: author.name,
        thumb_url,
        formats: { 
          possible: selection,
        }
      })
    
      video.save((err) => {
        if(err) console.log(err);
        console.log('saved');
      })
      
      return res.render('video', { 
        _id, 
        title, 
        thumb_url,  
        qualities, 
        vidPreview: iframe, 
        author: author.name, 
        formats: ['mp3', 'mp4'],
      });
    }

  } catch (error) {
    console.log(error);
  }

}

exports.getSelection = async (req, res, next) => {
  const url = 'https://www.youtube.com/watch?v='
  const { _id } = req.params;
  let { title, quality, format } = req.body;
  
  try {

    const itag = await getItag(quality, _id);

    const video =  await Video.findOne({ _id }).exec();

    const data = await ytdl(url+_id).pipe(fs.createWriteStream(`${_id}.${format}`));

    data.on('finish', () => {
      title = encodeURIComponent(title);
      format = encodeURIComponent(format);
      return res.redirect(`/${_id}/download?title=${title}&format=${format}`);  
    })
    
  } catch (error) {
    console.log(error);
    res.send('Error')
  }
}

async function getItag(quality, _id) {
  const video = await Video.findOne({ _id }).exec();
  return video.formats.possible.get(quality);
}

async function getQualities(_id) {
  const video = await Video.findOne({ _id }).exec();
  return [... video.formats.possible.keys()];
}