var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Application for bike route finder app.');
});

module.exports = router;
