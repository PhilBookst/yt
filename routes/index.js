var express = require('express');
var router = express.Router();
const videoController = require('../controllers/videoController');


/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('index');
});

router.get('/download/:id', videoController.download);

router.post('/', videoController.videoSubmit);

router.post('/:id', videoController.getSelection);

module.exports = router;
