var distanceCalculation = require('../utilities/distanceCalculation');
var Dijkstra = require('../utilities/dijkstra');
var NavigationRoute = require('../utilities/navigationRoute');
let path = require('ngraph.path');

function obtainCompleteDijkstraRoute(graph, decodedStartLocation, decodedEndLocation) {
  
  const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
  const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);

  var start = new Date();
  let bestNavigationRoute;
  const query = graph.generateDijkstraQuery();
  const dijkstra = new Dijkstra(query);
  possibleStartVertices.forEach((startVertexData) => {
    possibleEndVertices.forEach((endVertexData) => {
      const shortestRoute = dijkstra.findShortestPath(`${startVertexData.vertex.id}`, `${endVertexData.vertex.id}`);
      if (shortestRoute === null) {
        return;
      }
      console.log(`Nearest start vertex: ${JSON.stringify(startVertexData.vertex.id)}, end: ${JSON.stringify(endVertexData.vertex.id)}`);
      console.log(`Vertices ids: ${shortestRoute}`);
      const combined = graph.parseOptimizationResult(shortestRoute);
      console.log(`All weights: ${combined.map(route => route.weight)}`);
      
      let navigationRoute = new NavigationRoute(decodedStartLocation, decodedEndLocation, startVertexData.vertex, endVertexData.vertex, combined);
      console.log(`Found total weight Dijkstra: ${navigationRoute.totalWeightReachExcluded}`);
      if (bestNavigationRoute === undefined) {
        bestNavigationRoute = navigationRoute;
      } else if (navigationRoute.totalWeight < bestNavigationRoute.totalWeight) {
        bestNavigationRoute = navigationRoute;
      }
    });
  });
  var end = new Date() - start;
  console.log(`Executed Dijkstra: ${(possibleStartVertices.length * possibleEndVertices.length)} times.`);
  console.info('Dijkstra execution time: %dms', end);
  console.log(`Best route length route only: ${bestNavigationRoute.totalLengthReachExcluded}`);
  console.log(`Best route weight route only: ${bestNavigationRoute.totalWeightReachExcluded}`);

  bestNavigationRoute.loadTotalLength();
  bestNavigationRoute.loadTotalWeight();
  
  return bestNavigationRoute;
}

function obtainCompleteAStarRoute(graph, decodedStartLocation, decodedEndLocation) {
  
  const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
  const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);

  var start = new Date()
  let bestNavigationRoute;
  const aStarGraph = graph.genrateAStarGraph();
  possibleStartVertices.forEach((startVertexData) => {
    possibleEndVertices.forEach((endVertexData) => {
      let pathFinder = path.aStar(aStarGraph, {
        distance(fromNode, toNode, link) {
          return link.data.weight;
        },
        heuristic(fromNode, toNode) {
          return distanceCalculation.distanceBetweenLocations(toNode.data.vertex.centerLocation, decodedEndLocation.location);
        }
      });
      const shortestRouteArray = pathFinder.find(endVertexData.vertex.id, startVertexData.vertex.id);
      const shortestRouteVeritceIds = shortestRouteArray.map(data => data.id);
      console.log(`Nearest start vertex: ${JSON.stringify(startVertexData.vertex.id)}, end: ${JSON.stringify(endVertexData.vertex.id)}`);
      console.log(`Vertices ids: ${shortestRouteVeritceIds}`);
      console.log(`*******************************************************`);
      
      const combined = graph.parseOptimizationResult(shortestRouteVeritceIds);
      console.log(`All weights: ${combined.map(route => route.weight)}`);
      console.log(`*******************************************************`);
      console.log(`All lengths: ${combined.map(route => route.totalLength)}`);
      let navigationRoute = new NavigationRoute(decodedStartLocation, decodedEndLocation, startVertexData.vertex, endVertexData.vertex, combined);
      console.log(`*******************************************************`);
      console.log(`Found total weight A*: ${navigationRoute.totalWeightReachExcluded}`);
      if (bestNavigationRoute === undefined) {
        bestNavigationRoute = navigationRoute;
      } else if (navigationRoute.totalWeight < bestNavigationRoute.totalWeight) {
        bestNavigationRoute = navigationRoute;
      }
    });
  });
  var end = new Date() - start
  console.log(`*******************************************************`);
  console.log(`Executed A*: ${(possibleStartVertices.length * possibleEndVertices.length)} times.`);
  console.log(`*******************************************************`);
  console.info('A Star execution time: %dms', end)
  console.log(`*******************************************************`);
  console.log(`Best route length route only: ${bestNavigationRoute.totalLengthReachExcluded}`);
  console.log(`*******************************************************`);
  console.log(`Best route weight route only: ${bestNavigationRoute.totalWeightReachExcluded}`);

  bestNavigationRoute.loadTotalWeight();
  bestNavigationRoute.loadTotalLength();

  return bestNavigationRoute;
}

module.exports = {
  obtainCompleteDijkstraRoute,
  obtainCompleteAStarRoute,
};