const distanceCalculation = require('../utilities/distanceCalculation');

class NavigationRoute {

  constructor(startLocation, endLocation, startVertex, endVertex, routes) {
    this.startLocation = startLocation
    this.endLocation = endLocation
    this.startVertex = startVertex
    this.endVertex = endVertex
    this.routes = routes.map(route => route.copy());
    this.loadTotalLength();
    this.loadTotalWeight();
  }

  loadTotalLength() {
    let reachStartDistance = distanceCalculation.distanceBetweenLocations(this.startVertex.centerLocation, this.startLocation.location);
    let reachEndDistance = distanceCalculation.distanceBetweenLocations(this.endVertex.centerLocation, this.endLocation.location);
    let routeLength = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalLength), 0)
    this.totalLengthReachExcluded = routeLength;
    this.totalLength = routeLength + reachStartDistance + reachEndDistance;
    if (this.totalLengthReachExcluded === 0) {
      this.totalLength = Infinity;
      this.totalLengthReachExcluded = Infinity;
    }
  }

  loadTotalWeight() {
    let reachStartDistance = distanceCalculation.distanceBetweenLocations(this.startVertex.centerLocation, this.startLocation.location);
    let reachEndDistance = distanceCalculation.distanceBetweenLocations(this.endVertex.centerLocation, this.endLocation.location);
    let reachWeight = (reachStartDistance + reachEndDistance) * 3;
    let routeWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.weight), 0)
    this.totalWeightReachExcluded = routeWeight;
    this.totalWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.weight), 0) + reachWeight;
    if (this.totalWeightReachExcluded === 0) {
      this.totalWeight = Infinity;
      this.totalWeightReachExcluded = Infinity;
    }
  }

  reachStartCoordinates() {
    return [
      [parseFloat(this.startLocation.location.latitude), parseFloat(this.startLocation.location.longitude)], 
      [parseFloat(this.startVertex.centerLocation.latitude), parseFloat(this.startVertex.centerLocation.longitude)]
    ];
  }

  reachEndCoordinates() {
    return [
      [parseFloat(this.endVertex.centerLocation.latitude), parseFloat(this.endVertex.centerLocation.longitude)], 
      [parseFloat(this.endLocation.location.latitude), parseFloat(this.endLocation.location.longitude)]
    ];
  }
}

module.exports = NavigationRoute;