require('../extensions/number');
require('../extensions/array');

function distanceBetweenLocations(start, end) {
  const earthRadius = 6371;
  const latitudeDiff = Number(end.latitude-start.latitude).toRad();
  const longitudeDiff = Number(end.longitude-start.longitude).toRad();
  const a = Math.sin(latitudeDiff) * Math.sin(latitudeDiff/2) +
          Math.cos(Number(start.latitude).toRad()) * Math.cos(Number(end.latitude).toRad()) *
          Math.sin(longitudeDiff/2) * Math.sin(longitudeDiff/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const result = Math.floor((earthRadius * c) * 1000);
  return result;
}

function segmentLength(segment) {
  return distanceBetweenLocations(segment.start, segment.end);
}

module.exports = {
  'distanceBetweenLocations': distanceBetweenLocations,
  'segmentLength': segmentLength,
}
