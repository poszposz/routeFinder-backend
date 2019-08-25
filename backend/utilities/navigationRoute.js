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
    let reachWeight = (reachStartDistance + reachEndDistance) * 5;
    this.totalLength = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalLength), 0) + reachWeight;
  }

  loadTotalWeight() {
    let reachStartDistance = distanceCalculation.distanceBetweenLocations(this.startVertex.centerLocation, this.startLocation.location);
    let reachEndDistance = distanceCalculation.distanceBetweenLocations(this.endVertex.centerLocation, this.endLocation.location);
    this.totalWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalWeight), 0) + reachStartDistance + reachEndDistance;
  }
}

module.exports = NavigationRoute;