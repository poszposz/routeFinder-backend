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
    return this.routes.reduce(((currentTotal, route) => currentTotal + route.totalLength), 0);
  }

  loadTotalWeight() {
    let reachStartDistance = distanceCalculation.distanceBetweenLocations(this.startVertex.centerLocation, this.startLocation);
    let reachEndDistance = distanceCalculation.distanceBetweenLocations(this.endVertex.centerLocation, this.endLocation);
    let routesWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalWeight), 0);
    this.totalWeight = routesWeight + ((reachStartDistance + reachEndDistance) * 10);
  }
}

module.exports = NavigationRoute;