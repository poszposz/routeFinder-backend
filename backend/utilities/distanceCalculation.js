require('../extensions/number');
require('../extensions/array');
const haversine = require('haversine')

function distanceBetweenLocations(start, end) {
  let startDictionary = {
    latitude: start.latitude,
    longitude: start.longitude
  }
  let endDictionary = {
    latitude: end.latitude,
    longitude: end.longitude
  }
  return Math.floor(haversine(startDictionary, endDictionary, {unit: 'meter'}));
}

function exactDistanceBetweenLocations(start, end) {
  let startDictionary = {
    latitude: start.latitude,
    longitude: start.longitude
  }
  let endDictionary = {
    latitude: end.latitude,
    longitude: end.longitude
  }
  return haversine(startDictionary, endDictionary, {unit: 'meter'});
}

function segmentLength(segment) {
  return exactDistanceBetweenLocations(segment.start, segment.end);
}

module.exports = {
  'distanceBetweenLocations': distanceBetweenLocations,
  'segmentLength': segmentLength,
}
