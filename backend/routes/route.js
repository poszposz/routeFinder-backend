var decodeLocation = require('../utilities/locationDecoder');
var downloadService = require('../utilities/routeDownloadService');
var express = require('express');
var Graph = require('../optimization/graph');
var Dijkstra = require('../utilities/dijkstra');
var router = express.Router();

async function createGraph(startLocation, endLocation) {
  const decodedStartLocation = await decodeLocation(startLocation);
  const decodedEndLocation = await decodeLocation(endLocation);

  console.log(`Downloaded start location: ${JSON.stringify(decodedStartLocation)}`);
  console.log(`Downloaded end location: ${JSON.stringify(decodedEndLocation)}`);
  
  const routes = await downloadService.downloadRestrictedGraph(decodedStartLocation.location, decodedEndLocation.location);
  const graph = new Graph(routes);
  return {
    graph,
    decodedStartLocation,
    decodedEndLocation,
  }
}

router.get('/find', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  const decodedStartLocation = graphData.decodedStartLocation;
  const decodedEndLocation = graphData.decodedEndLocation;
  const startVertex = graph.nearestStartVertex(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertex(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  const dijkstra = new Dijkstra(query);
  const shortestRoute = dijkstra.findShortestPath(`${startVertex.id}`, `${endVertex.id}`);
  const combined = graph.parseDijkstraResult(shortestRoute);
  console.log(`All routes: ${combined.map((route) => JSON.stringify(route.debugDescription()))}`);
  
  let response = {
    'startLocation': decodedStartLocation,
    'endLocation': decodedEndLocation,
    'routes': combined,
  }
  res.json(response);
});

router.get('/findSimplifed', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  const decodedStartLocation = graphData.decodedStartLocation;
  const decodedEndLocation = graphData.decodedEndLocation;
  const startVertex = graph.nearestStartVertex(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertex(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  const dijkstra = new Dijkstra(query);
  const shortestRoute = dijkstra.findShortestPath(`${startVertex.id}`, `${endVertex.id}`);

  res.json(shortestRoute);
});


router.get('/restrictedArea', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  res.json(graph.generateGraphVisualization());
});

router.get('/dijkstraQuery', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  const decodedStartLocation = graphData.decodedStartLocation;
  const decodedEndLocation = graphData.decodedEndLocation;
  const startVertex = graph.nearestStartVertex(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertex(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  res.json(query);
});

module.exports = router;
