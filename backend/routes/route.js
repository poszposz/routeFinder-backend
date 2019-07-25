var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/find', function(req, res, next) {
  let { endLocation } = req.query;
  res.json({ routeDescription: `Searching route to: ${endLocation}`});
});

module.exports = router;
