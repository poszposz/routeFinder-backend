var distanceCalculation = require('../utilities/distanceCalculation');
var Dijkstra = require('../utilities/dijkstra');
var NavigationRoute = require('../utilities/navigationRoute');
let path = require('ngraph.path');

const ROUTE_SHORTEST = 'SHORTEST';

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

function obtainCompleteAStarRoute(graph, decodedStartLocation, decodedEndLocation, routeType) {

  let searchingShortest = routeType === ROUTE_SHORTEST;
  
  const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
  const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);

  var start = new Date()
  let bestNavigationRoute;
  const aStarGraph = graph.genrateAStarGraph(searchingShortest);
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
      // console.log(`Nearest start vertex: ${JSON.stringify(startVertexData.vertex.id)}, end: ${JSON.stringify(endVertexData.vertex.id)}`);
      const combined = graph.parseOptimizationResult(shortestRouteVeritceIds);
      let navigationRoute = new NavigationRoute(decodedStartLocation, decodedEndLocation, startVertexData.vertex, endVertexData.vertex, combined);
      console.log(`*******************************************************`);
      console.log(`Found total weight A*: ${navigationRoute.totalWeightReachExcluded}`);
      console.log(`Found total length A*: ${navigationRoute.totalLengthReachExcluded}`);
      console.log(`*******************************************************`);
      if (bestNavigationRoute === undefined) {
        bestNavigationRoute = navigationRoute;
      } else {
        if (searchingShortest) {
          if (navigationRoute.totalLength < bestNavigationRoute.totalLength) {
            bestNavigationRoute = navigationRoute;
          }
        }
        else {
          if (navigationRoute.totalWeight < bestNavigationRoute.totalWeight) {
            bestNavigationRoute = navigationRoute;
          }
        }
      }
    });
  });
  var end = new Date() - start
  console.log(`*******************************************************`);
  console.log(`Executed A*: ${(possibleStartVertices.length * possibleEndVertices.length)} times.`);
  console.info('A Star execution time: %dms', end)
  console.log(`Best route length: ${bestNavigationRoute.totalLength}`);
  console.log(`Best route weight: ${bestNavigationRoute.totalWeight}`);
  console.log(`*******************************************************`);

  bestNavigationRoute.loadTotalWeight();
  bestNavigationRoute.loadTotalLength();

  return bestNavigationRoute;
}

module.exports = {
  obtainCompleteDijkstraRoute,
  obtainCompleteAStarRoute,
};