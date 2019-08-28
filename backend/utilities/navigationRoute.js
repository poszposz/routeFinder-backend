var distanceCalculation = require('../utilities/distanceCalculation');

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
  }

  loadTotalWeight() {
    let reachStartDistance = distanceCalculation.distanceBetweenLocations(this.startVertex.centerLocation, this.startLocation.location);
    let reachEndDistance = distanceCalculation.distanceBetweenLocations(this.endVertex.centerLocation, this.endLocation.location);
    let reachWeight = (reachStartDistance + reachEndDistance) * 3;
    let routeWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.weight), 0)
    this.totalWeightReachExcluded = routeWeight;
    this.totalWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.weight), 0) + reachWeight;
  }
}

module.exports = NavigationRoute;