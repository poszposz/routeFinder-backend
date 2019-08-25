const Route = require('./routeModel');
const Segment = require('./segment');
const uuidv4 = require('./UUIDGenerator');
var distanceCalculation = require('../utilities/distanceCalculation');
var Dijkstra = require('../utilities/dijkstra');
var NavigationRoute = require('../utilities/navigationRoute');
let path = require('ngraph.path');

function stripUnrelevantStartingSegments(routes) {
  let count = 0;
  routes.forEach((route) => {
    // If it's the last one, we just quit.
    if (route === routes[routes.length - 1]) { 
      return
    }
    let nextRoute = routes[count + 1];
    nextRoute.segments = relevantStartSegments(route, nextRoute);
    nextRoute.adjustEndings();
    count += 1;
  });
  return routes;
}

function stripUnrelevantEndingSegments(routes) {
  let count = 1;
  routes.forEach((route) => {
    // If it's the first one, we just quit.
    if (route === routes[0] | route === routes[routes.length - 1]) {
      return
    }
    let nextRoute = routes[count + 1];
    route.segments = relevantEndSegments(route, nextRoute);
    route.adjustEndings();
    count += 1;
  });
  return routes;
}

function relevantEndSegments(route, nextRoute) {
  // Extract the ending of the first route.
  const start = nextRoute.start;
  
  /// We have to find segment of the next route that is the closest to the ending of the previous route.
  let sortedSegments = route.segments.concat().sort((segment1, segment2) => {
    return distanceCalculation.distanceBetweenLocations(start, segment1.end) - distanceCalculation.distanceBetweenLocations(start, segment2.end);
  });
  let nearest = sortedSegments[0];
  let nearestSegmentIndex = route.segments.findIndex(segment => segment.id === nearest.id);
  
  return route.segments.slice(0, nearestSegmentIndex);
}

function relevantStartSegments(route, nextRoute) {
  // Extract the ending of the first route.
  const end = route.end;
  
  /// We have to find segment of the next route that is the closest to the ending of the previous route.
  let sortedSegments = nextRoute.segments.concat().sort((segment1, segment2) => {
    return distanceCalculation.distanceBetweenLocations(end, segment1.start) - distanceCalculation.distanceBetweenLocations(end, segment2.start);
  });
  let nearest = sortedSegments[0];
  let nearestSegmentIndex = nextRoute.segments.findIndex((segment) => segment.id === nearest.id);
  return nextRoute.segments.slice(nearestSegmentIndex, nextRoute.segments.length);
}

function mergeRoutes(routes) {
  let mergedRoutes = [];
  let count = 0;
  routes.forEach((route) => {
    // We push the route the the exisitng array
    mergedRoutes.push(route);
    // If it's the last one, we just push it to the array and quit.s
    if (route === routes[routes.length - 1]) { 
      return
    }
    // We create a route that will link the end of the current route with the start of the next route from the array.
    let nextRoute = routes[count + 1];
    let linkSegment = new Segment([route.end.longitude, route.end.latitude, nextRoute.start.longitude, nextRoute.start.latitude], 'Link');
    let linkRoute = new Route(uuidv4(), "Link", "link", [linkSegment], true);
    mergedRoutes.push(linkRoute);
    count += 1;
  });
  return mergedRoutes;
}

function obtainCompleteDijkstraRoute(graph, decodedStartLocation, decodedEndLocation) {
  
  const possibleStartVertices = graph.nearestStartVertices(decodedStartLocation.location);
  const possibleEndVertices = graph.nearestEndVertices(decodedEndLocation.location);

  var start = new Date()
  let bestNavigationRoute;
  const query = graph.generateDijkstraQuery();
  const dijkstra = new Dijkstra(query);
  possibleStartVertices.forEach((startVertexData) => {
    possibleEndVertices.forEach((endVertexData) => {
      let bestVertexCompensationWeight = 1;
      // Add compensation to try to favorize the route theat uses nearest start and end vertex.
      if (startVertexData.isBest) {
        bestVertexCompensationWeight -= 0.1;
      }
      if (endVertexData.isBest) {
        bestVertexCompensationWeight -= 0.1;
      }
      const shortestRoute = dijkstra.findShortestPath(`${startVertexData.vertex.id}`, `${endVertexData.vertex.id}`);
      if (shortestRoute === null) {
        return;
      }
      const combined = graph.parseDijkstraResult(shortestRoute);
      let navigationRoute = new NavigationRoute(decodedStartLocation, decodedEndLocation, startVertexData.vertex, endVertexData.vertex, combined);
      navigationRoute.totalWeight = navigationRoute.totalWeight * bestVertexCompensationWeight;
      console.log(`Found weight: ${navigationRoute.totalWeight}`);
      if (bestNavigationRoute === undefined) {
        bestNavigationRoute = navigationRoute;
      } else if (navigationRoute.totalWeight < bestNavigationRoute.totalWeight) {
        bestNavigationRoute = navigationRoute;
      }
    });
  });
  var end = new Date() - start
  console.log(`Executed Dijkstra: ${(possibleStartVertices.length * possibleEndVertices.length)} times.`);
  console.info('Dijkstra execution time: %dms', end)
  console.log(`Best route length: ${bestNavigationRoute.totalLength}`);
  console.log(`Best route weight: ${bestNavigationRoute.totalWeight}`);

  bestNavigationRoute.routes = stripUnrelevantEndingSegments(bestNavigationRoute.routes);
  bestNavigationRoute.routes = stripUnrelevantStartingSegments(bestNavigationRoute.routes);
  bestNavigationRoute.routes = mergeRoutes(bestNavigationRoute.routes);
  bestNavigationRoute.loadTotalLength();
  bestNavigationRoute.loadTotalWeight();
  optimizeRouteEndings(bestNavigationRoute);
  
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
      let bestVertexCompensationWeight = 1;
      // Add compensation to try to favorize the route theat uses nearest start and end vertex.
      if (startVertexData.isBest) {
        bestVertexCompensationWeight -= 0.1;
      }
      if (endVertexData.isBest) {
        bestVertexCompensationWeight -= 0.1;
      }
      let pathFinder = path.aStar(aStarGraph, {
        distance(fromNode, toNode, link) {
          return link.data.weight * bestVertexCompensationWeight;
        },
        heuristic(fromNode, toNode) {
          return distanceCalculation.distanceBetweenLocations(toNode.data.vertex.centerLocation, decodedEndLocation.location);
        }
      });
      const shortestRouteArray = pathFinder.find(startVertexData.vertex.id, endVertexData.vertex.id);
      const shortestRouteVeritceIds = shortestRouteArray.map(data => data.id).reverse();
      
      const combined = graph.parseDijkstraResult(shortestRouteVeritceIds);
      let navigationRoute = new NavigationRoute(decodedStartLocation, decodedEndLocation, startVertexData.vertex, endVertexData.vertex, combined);
      console.log(`Found weight(mapping to Dijsktra results): ${navigationRoute.totalWeight * bestVertexCompensationWeight}, real: ${navigationRoute.totalWeight}`);
      if (bestNavigationRoute === undefined) {
        bestNavigationRoute = navigationRoute;
      } else if (navigationRoute.totalWeight < bestNavigationRoute.totalWeight) {
        bestNavigationRoute = navigationRoute;
      }
    });
  });
  var end = new Date() - start
  console.log(`Executed A*: ${(possibleStartVertices.length * possibleEndVertices.length)} times.`);
  console.info('A Star execution time: %dms', end)
  console.log(`Best route length: ${bestNavigationRoute.totalLength}`);
  console.log(`Best route weight: ${bestNavigationRoute.totalWeight}`);

  bestNavigationRoute.routes = stripUnrelevantEndingSegments(bestNavigationRoute.routes);
  bestNavigationRoute.routes = stripUnrelevantStartingSegments(bestNavigationRoute.routes);
  bestNavigationRoute.routes = mergeRoutes(bestNavigationRoute.routes);
  bestNavigationRoute.loadTotalWeight();
  bestNavigationRoute.loadTotalLength();
  optimizeRouteEndings(bestNavigationRoute);

  return bestNavigationRoute;
}

function optimizeRouteEndings(navigationRoute) {
  let offset = 5;

  let start = navigationRoute.startLocation.location;
  let startingRoute = navigationRoute.routes[0];
  let sortedStartSegments = startingRoute.segments.concat().sort((segment1, segment2) => {
    return distanceCalculation.distanceBetweenLocations(start, segment1.start) - distanceCalculation.distanceBetweenLocations(start, segment2.start);
  });
  let nearestStart = sortedStartSegments[0];
  let nearestStartDistanceWithOffset = distanceCalculation.distanceBetweenLocations(start, nearestStart.start) + offset;
  let bestStartSegment;
  startingRoute.segments.forEach(segment => {
    let distance = distanceCalculation.distanceBetweenLocations(start, segment.start)
    if (distance < nearestStartDistanceWithOffset) {
      bestStartSegment = segment;
    }
  });
  const bestStartSegmentIndex = startingRoute.segments.findIndex(segment => segment === bestStartSegment);

  startingRoute.segments = startingRoute.segments.slice(bestStartSegmentIndex, startingRoute.segments.length);
  startingRoute.adjustEndings();

  let end = navigationRoute.endLocation.location;
  let endingRoute = navigationRoute.routes[navigationRoute.routes.length - 1];
  let sortedEndSegments = endingRoute.segments.concat().sort((segment1, segment2) => {
    return distanceCalculation.distanceBetweenLocations(end, segment1.end) - distanceCalculation.distanceBetweenLocations(end, segment2.end);
  });
  let nearestEnd = sortedEndSegments[0];
  let nearestEndDistanceWithOffset = distanceCalculation.distanceBetweenLocations(end, nearestEnd.end) + offset;
  let bestEndSegment;
  endingRoute.segments.concat().reverse().forEach(segment => {
    let distance = distanceCalculation.distanceBetweenLocations(end, segment.end)
    if (distance < nearestEndDistanceWithOffset) {
      bestEndSegment = segment;
    }
  });
  const bestEndSegmentIndex = endingRoute.segments.findIndex(segment => segment.id === bestEndSegment.id);

  endingRoute.segments = endingRoute.segments.slice(0, bestEndSegmentIndex);
  endingRoute.adjustEndings();
}

module.exports = {
  obtainCompleteDijkstraRoute,
  obtainCompleteAStarRoute,
  mergeRoutes,
  stripUnrelevantStartingSegments,
  stripUnrelevantEndingSegments,
};