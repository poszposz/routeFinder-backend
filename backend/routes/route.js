var decodeLocation = require('../utilities/locationDecoder');
var downloadService = require('../utilities/routeDownloadService');
var express = require('express');
var Graph = require('../optimization/graph');
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

router.get('/findOptimized', async function(req, res, next) {
  let { startLocation, endLocation, startLocationLatitude, startLocationLongitude } = req.query;
  try {
    let decodedStartLocation;
    if (startLocationLatitude === undefined | startLocationLongitude === undefined) {
      decodedStartLocation = await decodeLocation(startLocation);
    } else {
      decodedStartLocation = {
        displayName: 'User defined',
        location: {
          latitude: parseFloat(startLocationLatitude),
          longitude: parseFloat(startLocationLongitude),
        }
      };
    }
    const decodedEndLocation = await decodeLocation(endLocation);
    const result = routeCreator.obtainCompleteRoute(preDownloadedGraph, decodedStartLocation, decodedEndLocation);
    let response = {
      'startLocation': decodedStartLocation,
      'endLocation': decodedEndLocation,
      'totalLength': result.bestNavigationRoute.totalLength,
      'routes':  result.allRoutes,
    };
    res.json(response);
  } catch (error) {
    console.log(`Error: ${error}`);
    next(error);
  }
});

router.get('/visualizationPoints', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  try {
    const decodedStartLocation = await decodeLocation(startLocation);
    const decodedEndLocation = await decodeLocation(endLocation);
    const result = routeCreator.obtainCompleteRoute(preDownloadedGraph, decodedStartLocation, decodedEndLocation);
    const mappedResults = result.allRoutes.map(route => route.segments).flatten().map(segment => {
      return [parseFloat(segment.start.latitude), parseFloat(segment.start.longitude)];
    });
    res.json(mappedResults);
  } catch (error) {
    console.log(`Error: ${error}`);
    next(error);
  }
});

router.get('/restrictedArea', async function(req, res, next) {
  let { startLocation, endLocation } = req.query;
  const graphData = await createGraph(startLocation, endLocation);
  const graph = graphData.graph;
  res.json(graph.generateGraphVisualization());
});

module.exports = { 
  router,
  downloadInitialGraph,
}
