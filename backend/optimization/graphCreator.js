const distanceBetweenLocations = require('./../utilities/distanceCalculation');

const desiredDistanceThreshold = 50;

function createGraph(routes) {
  routes.forEach((route) => {
    const end = route.end;
    const matchingStartingPoints = routes.forEach((route) => {
      const distance = distanceBetweenLocations(end, route.start);
      return distance < desiredDistanceThreshold;
    });
  });
};

module.exports = createGraph;