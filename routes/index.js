var express = require('express');
var router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/', (req, res, next) => {
  res.render('index');
})

router.post('/download', videoController.videoSubmit);

// router.post('/:_id/download', videoController.download);

module.exports = router;