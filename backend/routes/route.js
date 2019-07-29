var decodeLocation = require('../utilities/locationDecoder');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/find', async function(req, res, next) {
  let { endLocation } = req.query;
  const location = await decodeLocation(endLocation);
  res.json(location);
});

module.exports = router;
