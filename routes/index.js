var express = require('express');
var router = express.Router();
const videoController = require('../controllers/videoController');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   return res.render('index');
// });

router.get('/', (req, res, next) => {
  res.render('index');
})


router.post('/', videoController.videoSubmit);

router.post('/:_id/download', videoController.getSelection);

module.exports = router;
