const ytdl = require('ytdl-core');
const fs = require('fs');
const merge = require('merge2');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');

exports.videoSubmit = async (req, res, next) => {

  try {
    
    const { url, quality } = req.body;
  
    if(!ytdl.validateURL(url)) res.render('index', { error: 'Not a valid URL !' });

    //const _id = await ytdl.getURLVideoID(url);
    let { videoDetails } = await ytdl.getInfo(url);

    let { title } = videoDetails;

    if(quality == 'mp4hd') {

      const video = await ytdl(url, { filter: format => format.container === 'webm' })
      const audio = await ytdl(url, { filter: format => format.container === 'mp3' })

      
      res.setHeader('Content-disposition', `attachment; filename=${title}.webm`);
      res.setHeader('Content-type', 'video/webm');
      
      video.on('error', (err) => console.log(err));
      
      video
      .on('end', () => {
        console.log('end');
      })
      
      
      .pipe(res);
      
    } 
    else if(quality == 'mp4') {
      res.header('Content-disposition', 'attachment; filename=' + `${title}.mp4`);
      await ytdl(url).pipe(res);
    } 
    else {
      res.header('Content-disposition', 'attachment; filename=' + `${title}.mp3`);
      await ytdl(url, { quality: 'highestaudio' }).pipe(res);
    }

  } catch (error) {
    console.log(error);
    res.render('index', { error: 'Error. Please try again!' });
  }

}

async function MergeStreams(url) {
  const audio = await ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
  const video = await ytdl(url, { filter: 'videoonly', quality: 'highestvideo' });

  console.log(audio);
  console.log(video);

  const stream = merge(video, audio);
  return stream;
}
