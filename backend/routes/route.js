var decodeLocation = require('../utilities/locationDecoder');
var downloadService = require('../utilities/routeDownloadService');
var express = require('express');
var Graph = require('../optimization/graph');
var Dijkstra = require('../utilities/dijkstra');
var routeCreator = require('../utilities/routeCreator');
var router = express.Router();

let preDownloadedGraph = undefined;

async function downloadInitialGraph() {
  console.log('Downloading initial full routes graph for Kraków');
  const routes = await downloadService.downloadCompleteGraph();
  preDownloadedGraph = new Graph(routes);
  console.log('Downloaded initial full routes graph for Kraków');
}

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
  try {
    const graphData = await createGraph(startLocation, endLocation);
    const graph = graphData.graph;
    const decodedStartLocation = graphData.decodedStartLocation;
    const decodedEndLocation = graphData.decodedEndLocation;
    const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
    const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);
    console.log(`Nearest start vertices: ${possibleStartVertices.map(vertex => vertex.id)}`);
    console.log(`Nearest end vertices: ${possibleEndVertices.map(vertex => vertex.id)}`);
    
    let currentBestLenght = Infinity;
    let bestStartVertex;
    let bestEndVertex;
    let bestRoute;
    possibleStartVertices.forEach((startVertex) => {
      possibleEndVertices.forEach((endVertex) => {
        const query = graph.generateDijkstraQuery();
        const dijkstra = new Dijkstra(query);
        const shortestRoute = dijkstra.findShortestPath(`${startVertex.id}`, `${endVertex.id}`);
        // console.log(`Found route: ${shortestRoute}`);
        if (shortestRoute === null) {
          return;
        }
        const combined = graph.parseDijkstraResult(shortestRoute);
        const totalLength = routeCreator.totalLength(combined);
        if (bestRoute === undefined) {
          currentBestLenght = totalLength;
          bestRoute = combined;
          bestStartVertex = startVertex;
          bestEndVertex = endVertex;
        } else if (totalLength < currentBestLenght & !routeCreator.isSubset(bestRoute, combined)) {
          currentBestLenght = totalLength;
          bestRoute = combined;
          bestStartVertex = startVertex;
          bestEndVertex = endVertex;
        }
      });
    });
    console.log(`Best start vertex: ${bestStartVertex.id}`);
    console.log(`Nearest end vertices: ${bestEndVertex.id}`);

    let stripped = routeCreator.stripUnrelevantStartingSegments(bestRoute);
    stripped = routeCreator.stripUnrelevantEndingSegments(stripped);
    const combinedMerged = routeCreator.mergeRoutes(stripped);
    let response = {
      'startLocation': decodedStartLocation,
      'endLocation': decodedEndLocation,
      'totalLength': currentBestLenght,
      'routes': combinedMerged,
    };
    res.json(response);
  } catch (error) {
    console.log(`Error: ${error}`);
    next(error);
  }
});

router.get('/findOptimized', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  try {
    const graph = preDownloadedGraph;
    const decodedStartLocation = await decodeLocation(startLocation);
    const decodedEndLocation = await decodeLocation(endLocation);
    const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
    const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);
    console.log(`Nearest start vertices: ${possibleStartVertices.map(vertex => vertex.id)}`);
    console.log(`Nearest end vertices: ${possibleEndVertices.map(vertex => vertex.id)}`);
    
    let currentBestLenght = Infinity;
    let bestStartVertex;
    let bestEndVertex;
    let bestRoute;
    possibleStartVertices.forEach((startVertex) => {
      possibleEndVertices.forEach((endVertex) => {
        const query = graph.generateDijkstraQuery();
        const dijkstra = new Dijkstra(query);
        const shortestRoute = dijkstra.findShortestPath(`${startVertex.id}`, `${endVertex.id}`);
        // console.log(`Found route: ${shortestRoute}`);
        if (shortestRoute === null) {
          return;
        }
        const combined = graph.parseDijkstraResult(shortestRoute);
        const totalLength = routeCreator.totalLength(combined);
        if (bestRoute === undefined) {
          currentBestLenght = totalLength;
          bestRoute = combined;
          bestStartVertex = startVertex;
          bestEndVertex = endVertex;
        } else if (totalLength < currentBestLenght & !routeCreator.isSubset(bestRoute, combined)) {
          currentBestLenght = totalLength;
          bestRoute = combined;
          bestStartVertex = startVertex;
          bestEndVertex = endVertex;
        }
      });
    });
    console.log(`Best start vertex: ${bestStartVertex.id}`);
    console.log(`Nearest end vertices: ${bestEndVertex.id}`);

    let stripped = routeCreator.stripUnrelevantStartingSegments(bestRoute);
    stripped = routeCreator.stripUnrelevantEndingSegments(stripped);
    const combinedMerged = routeCreator.mergeRoutes(stripped);
    let response = {
      'startLocation': decodedStartLocation,
      'endLocation': decodedEndLocation,
      'totalLength': currentBestLenght,
      'routes': combinedMerged,
    };
    res.json(response);
  } catch (error) {
    console.log(`Error: ${error}`);
    next(error);
  }
});

router.get('/findSimplifed', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  const decodedStartLocation = graphData.decodedStartLocation;
  const decodedEndLocation = graphData.decodedEndLocation;
  const startVertex = graph.nearestStartVertices(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertices(decodedEndLocation.location);
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
  const startVertex = graph.nearestStartVertices(decodedStartLocation.location);
  const endVertex = graph.nearestEndVertices(decodedEndLocation.location);
  console.log(`Nearest start vertex: ${startVertex.id}`);
  console.log(`Nearest end vertex: ${endVertex.id}`);
  
  const query = graph.generateDijkstraQuery();
  res.json(query);
});

module.exports = { 
  router,
  downloadInitialGraph,
}
