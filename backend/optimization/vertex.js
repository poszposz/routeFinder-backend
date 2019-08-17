const LocationCoordinate = require('../utilities/locationCoordinate');
var distanceCalculation = require('../utilities/distanceCalculation');

class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes) {
    this.id = id;

    const incomingLocations = incomingRoutes.map((incomingRoute) => incomingRoute.end);
    const outcomingLocations =  outcomingRoutes.map((outcomingRoutes) => outcomingRoutes.start);
    const allLocations = incomingLocations.concat(outcomingLocations);
    let length = allLocations.length !== 0 ? allLocations.length : 1;
    const latitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.latitude), 0) / length;
    const longitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.longitude), 0) / length;
    this.centerLocation = new LocationCoordinate(latitudeAverage, longitudeAverage);

    this.incomingRoutes = incomingRoutes === undefined ? [] : incomingRoutes;
    this.outcomingRoutes = outcomingRoutes === undefined ? [] : outcomingRoutes;
  }

  reloadCenterLocation() {
    const incomingLocations = this.incomingRoutes.map((incomingRoute) => incomingRoute.end);
    const outcomingLocations =  this.outcomingRoutes.map((outcomingRoutes) => outcomingRoutes.start);
    const allLocations = incomingLocations.concat(outcomingLocations);
    let length = allLocations.length !== 0 ? allLocations.length : 1;
    const latitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.latitude), 0) / length;
    const longitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.longitude), 0) / length;
    this.centerLocation = new LocationCoordinate(latitudeAverage, longitudeAverage);
  }

  generateOutcomingRoutes() {
    let transformedRoutes = {};
    this.outcomingRoutes.forEach((route) => {
      if (route.endPointVertexId === this.id) { return; }
      const distanceToStart = distanceCalculation.distanceBetweenLocations(route.start, this.centerLocation);
      const distanceToEnd = distanceCalculation.distanceBetweenLocations(route.start, this.centerLocation);
      const distance = Math.min(distanceToStart, distanceToEnd);
      transformedRoutes[`${route.endPointVertexId}`] = route.totalLength + distance * 20;
    });
    return transformedRoutes;
  }

  findRouteTo(endVertexId) {
    return this.outcomingRoutes.find((route) => route.endPointVertexId == endVertexId);
  }

  addIncomingRoutes(routes) {
    const foundRoutes = routes.filter((route) => {
      if (route.startPointVertexId === this.id & route.endPointVertexId === this.id) { return false; }
      const foundRoute = this.incomingRoutes.find((incomingRoute) => {
        return route.id === incomingRoute.id;
      });
      return foundRoute === undefined;
    });
    if (foundRoutes.length === 0) { return; }
    this.incomingRoutes = this.incomingRoutes.concat(foundRoutes);
  }

  addOutcomingRoutes(routes) {
    const foundRoutes = routes.filter((route) => {
      if (route.startPointVertexId === this.id & route.endPointVertexId === this.id) { return false; }
      const foundRoute = this.outcomingRoutes.find((outcomingRoute) => {
        return route.id === outcomingRoute.id;
      });
      return foundRoute === undefined;
    });
    if (foundRoutes.length === 0) { return; }
    this.outcomingRoutes = this.outcomingRoutes.concat(foundRoutes);
  }

  debugDescription() {
    let incoming = []
    let outcoming = []
    this.outcomingRoutes.forEach((route) => {
      outcoming.push(route.debugDescription());
    });
    this.incomingRoutes.forEach((route) => {
      incoming.push(route.debugDescription());
    });
    return {
      incoming: incoming,
      outcoming: outcoming,
    };;
  }
}

module.exports= Vertex;