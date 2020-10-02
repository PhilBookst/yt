const ytdl = require('ytdl-core');

exports.videoSubmit = async (req, res, next) => {

  try {
    
    const { url, quality } = req.body;

    console.log(url);
    console.log(quality);
  
    if(!ytdl.validateURL(url)) return res.json({ error: 'Not a valid URL !' });

    //const _id = await ytdl.getURLVideoID(url);
    let { videoDetails } = await ytdl.getInfo(url);

    let { title } = videoDetails;

    if(quality == 'mp4hd') {

      const video = await ytdl(url, { filter: format => format.container === 'webm' })
      const audio = await ytdl(url, { filter: format => format.container === 'mp3' })

      res.set({
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Content-Type': 'video/webm',
        'Content-Disposition': `attachment; filename='${title}.webm'`,
      });
      
      video.on('error', (err) => console.log(err));
      
      video
      .on('end', () => {
        console.log('end');
      })
      
      
      .pipe(res);
      
    } 
    else if(quality == 'mp4') {
      res.set({
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename='${title}.mp4'`,
      });
      await ytdl(url).pipe(res);
    } 
    else {
      res.set({
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Content-Type': 'audio/mp3',
        'Content-Disposition': `attachment; filename='${title}.mp3'`,
      });

      await ytdl(url, { quality: 'highestaudio' }).pipe(res);
    }

  } catch (error) {
    console.log(error);
    res.render('index', { error: 'Error. Please try again!' });
  }

}

