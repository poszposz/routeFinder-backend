var decodeLocation = require('../utilities/locationDecoder');
var downloadGraph = require('../utilities/routeDownloadService');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/find', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  
  if (startLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No start location provided.' });
  }
  if (endLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No end location provided.' });
  }
  const decodedEndLocation = await decodeLocation(endLocation);
  const decodedStartLocation = await decodeLocation(startLocation);
  const route = await downloadGraph(decodedStartLocation.location, decodedEndLocation.location);
  res.json(route);
});

module.exports = router;