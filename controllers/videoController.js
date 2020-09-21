const ytdl = require('ytdl-core');
const fs = require('fs');
const Video = require('../models/videoSchema');


exports.download = (req, res, next) => {
  let { id } = req.params;
  let { format, title } = req.query;

  title = decodeURIComponent(title);
  format = decodeURIComponent(format);
  
  //const ytdlTitle = title.split(' ').join('-');

  res.download(`${id}.${format}`, `${title}.${format}` ,(err) => {
    if(err) console.log(err);
    console.log('downloaded');
  })
}

exports.videoSubmit = async (req, res, next) => {
  const { url } = req.body;

  if(!ytdl.validateURL(url)) res.render('index', { error: 'Not a valid URL' });
  
  let { videoDetails, formats } = await ytdl.getBasicInfo(url);
  let { author, title, thumbnail} = videoDetails;
  let thumb_url = thumbnail.thumbnails.slice(-1)[0].url;
  
  const id = await ytdl.getURLVideoID(url);
  const iframe = `https://www.youtube.com/embed/${id}`;

  const selection = new Map();

  formats.reduceRight((prev, curr) => {
    if(curr.qualityLabel && curr.mimeType.includes('mp4') && !selection.has(curr.qualityLabel)) selection.set(curr.qualityLabel, curr.itag);
    return prev;
  }, []);

  const qualities = [... selection.keys()];

  // Manage file system and path structure 
  // 1080p+ => seperate stream download and merge 

  const video = new Video({
    vidID: id,
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
    id, 
    title, 
    thumb_url,  
    qualities, 
    vidPreview: iframe, 
    author: author.name, 
    formats: ['mp3', 'mp4'],
  });
}

exports.getSelection = async (req, res, next) => {
  const url = 'https://www.youtube.com/watch?v='
  const { id } = req.params;
  let { title, quality, format } = req.body;
  
  try {

    const video = await Video.findOne({ vidID: id }).populate('saved').exec();
    

    
    const file = await ytdl(url+id).pipe(fs.createWriteStream(`${id}.${format}`));
  
    file.on('finish', () => {
      title = encodeURIComponent(title);
      format = encodeURIComponent(format);
    
      return res.redirect(`/download/${id}?title=${title}&format=${format}`);
    });
  
    file.on('error', (err) => {
      console.log(err);
      res.send('Error')
    })
    
  } catch (error) {
    console.log(error);
    res.send('Error')
  }
}