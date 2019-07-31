require('../extensions/number');
require('../extensions/array');

function distanceBetweenLocations(start, end) {
  const earthRadius = 6371;
  const latitudeDiff = (end.latitude-start.latitude).toRad();
  const longitudeDiff = (end.longitude-start.longitude).toRad();
  const a = Math.sin(latitudeDiff) * Math.sin(latitudeDiff/2) +
          Math.cos(start.latitude.toRad()) * Math.cos(end.latitude.toRad()) *
          Math.sin(longitudeDiff/2) * Math.sin(longitudeDiff/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const result = Math.floor((earthRadius * c) * 1000);
  return result;
}

function segmentLength(segment) {
  return distanceBetweenLocations(segment.start, segment.end);
}

function findNearest(location, routes, maximumRadius) {
  var radius = 1;
  var nearestRoutes = findRoutes(location, routes, radius);
  while (nearestRoutes.length == 0 && radius < maximumRadius) {
    radius = radius + 10;
    nearestRoutes = findRoutes(location, routes, radius);
  }
  return nearestRoutes;
}

function findRoutes(location, routes, radius) {
  return routes.filter((route) => {
    if (route.start.equals(location) || route.end.equals(location)) { return false }
    return distanceBetweenLocations(location, route.start) <= radius;
  });
}

module.exports = {
  'distanceBetweenLocations': distanceBetweenLocations,
  'segmentLength': segmentLength,
  'findNearest': findNearest
}
