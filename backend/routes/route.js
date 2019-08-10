var decodeLocation = require('../utilities/locationDecoder');
var downloadService = require('../utilities/routeDownloadService');
var express = require('express');
var Graph = require('../optimization/graph');
var Dijkstra = require('../utilities/dijkstra');
var router = express.Router();

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
  const decodedStartLocation = await decodeLocation(startLocation);
  const decodedEndLocation = await decodeLocation(endLocation);

  console.log(`Downloaded start location: ${JSON.stringify(decodedStartLocation)}`);
  console.log(`Downloaded end location: ${JSON.stringify(decodedEndLocation)}`);
  
  const routes = await downloadService.downloadRestrictedGraph(decodedStartLocation.location, decodedEndLocation.location);
  const graph = new Graph(routes);
  const startVertex = graph.nearestStartVertex(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertex(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  const dijkstra = new Dijkstra(query);
  const shortestRoute = dijkstra.findShortestPath(`${startVertex.id}`, `${endVertex.id}`);

  // console.log(`Query: ${JSON.stringify(query)}`);
  // console.log(`Start vertex: ${startVertex.id}`);
  // console.log(`End vertex: ${endVertex.id}`);

  res.json(shortestRoute);
});


router.get('/restrictedArea', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  
  if (startLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No start location provided.' });
  }
  if (endLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No end location provided.' });
  }
  const decodedStartLocation = await decodeLocation(startLocation);
  const decodedEndLocation = await decodeLocation(endLocation);

  console.log(`Downloaded start location: ${JSON.stringify(decodedStartLocation)}`);
  console.log(`Downloaded end location: ${JSON.stringify(decodedEndLocation)}`);
  
  const routes = await downloadService.downloadRestrictedGraph(decodedStartLocation.location, decodedEndLocation.location);
  const graph = new Graph(routes);
  res.json(graph.generateGraphVisualization());
});

router.get('/dijkstraQuery', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  
  if (startLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No start location provided.' });
  }
  if (endLocation === undefined) {
    res.status(401);
    res.render('error', { error: 'No end location provided.' });
  }
  const decodedStartLocation = await decodeLocation(startLocation);
  const decodedEndLocation = await decodeLocation(endLocation);

  console.log(`Downloaded start location: ${JSON.stringify(decodedStartLocation)}`);
  console.log(`Downloaded end location: ${JSON.stringify(decodedEndLocation)}`);
  
  const routes = await downloadService.downloadRestrictedGraph(decodedStartLocation.location, decodedEndLocation.location);
  const graph = new Graph(routes);
  const startVertex = graph.nearestStartVertex(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertex(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  res.json(query);
});

module.exports = router;
