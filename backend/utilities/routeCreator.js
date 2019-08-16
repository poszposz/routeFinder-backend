const Route = require('./routeModel');
const Segment = require('./segment');
const uuidv4 = require('./UUIDGenerator');
var distanceCalculation = require('../utilities/distanceCalculation');

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
  let count = 0;
  routes.forEach((route) => {
    // If it's the first one, we just quit.
    if (route === routes[0]) { 
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
    return distanceCalculation.distanceBetweenLocations(start, segment2.end) - distanceCalculation.distanceBetweenLocations(start, segment1.end);
  });
  let nearest = sortedSegments[0];
  let nearestSegmentIndex = route.segments.findIndex((segment) => segment.id === nearest.id);
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
    // If it's the last one, we just push it to the array and quit.
    if (route === routes[routes.length - 1]) { 
      return
    }
    // We create a route that will link the end of the current route with the start of the next route from the array.
    let nextRoute = routes[count + 1];
    let linkSegment = new Segment([route.end.longitude, route.end.latitude, nextRoute.start.longitude, nextRoute.start.latitude], 'Link');
    let linkRoute = new Route(uuidv4(), "Link", "link", [linkSegment], false);
    mergedRoutes.push(linkRoute);
    count += 1;
  });
  return mergedRoutes;
}

function isSubset(mainRouteDijkstraArray, routeDijkstraArray) {
  let isSubset = routeDijkstraArray.every(element => mainRouteDijkstraArray.includes(element));
  return isSubset;
}

function totalLength(routes) {
  return routes.reduce(((currentTotal, route) => currentTotal + route.totalLength), 0);
}

module.exports = {
  mergeRoutes,
  stripUnrelevantStartingSegments,
  stripUnrelevantEndingSegments,
  isSubset,
  totalLength,
};