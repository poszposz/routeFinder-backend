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
    this.totalLength = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalLength), 0);
  }

  loadTotalWeight() {
    this.totalWeight = this.routes.reduce(((currentTotal, route) => currentTotal + route.totalWeight), 0);    

  }
}

module.exports = NavigationRoute;