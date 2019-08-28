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

    this.assignTotalWeights();
  }

  assignTotalWeights() {
    this.assignEndingWeights(this.incomingRoutes);
    this.assignStartingWeights(this.outcomingRoutes);
  }

  assignEndingWeights(routes) {
    routes.forEach((route) => {
      if (route.hasAssignedEndingWeight) { return; }
      let distanceToEnd = distanceCalculation.distanceBetweenLocations(route.end, this.centerLocation);
      distanceToEnd = distanceToEnd <= 5 ? 0 : distanceToEnd;
      const weight = (route.totalLength * route.weightMultiplier) + (distanceToEnd * 8);
      route.weight = weight;
      route.hasAssignedEndingWeight = true;
    });
  }

  assignStartingWeights(routes) {
    routes.forEach((route) => {
      if (route.hasAssignedStartingWeight) { return; }
      let distanceToStart = distanceCalculation.distanceBetweenLocations(route.start, this.centerLocation);
      distanceToStart = distanceToStart <= 5 ? 0 : distanceToStart;
      const weight = (route.totalLength * route.weightMultiplier) + (distanceToStart * 8);
      route.weight = weight;
      route.hasAssignedStartingWeight = true;
    });
  }

  reloadCenterLocation() {
    // const incomingLocations = this.incomingRoutes.map((incomingRoute) => incomingRoute.end);
    // const outcomingLocations =  this.outcomingRoutes.map((outcomingRoutes) => outcomingRoutes.start);
    // const allLocations = incomingLocations.concat(outcomingLocations);
    
    // let length = allLocations.length !== 0 ? allLocations.length : 1;
    // const latitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.latitude), 0) / length;
    // const longitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.longitude), 0) / length;
    // this.centerLocation = new LocationCoordinate(latitudeAverage, longitudeAverage);
  }

  generateOutcomingRoutes() {
    let transformedRoutes = {};
    this.outcomingRoutes.forEach((route) => {
      if (route.endPointVertexId === this.id) { return; }
      transformedRoutes[`${route.endPointVertexId}`] = route.weight;
    });
    return transformedRoutes;
  }

  findRouteTo(endVertexId) {
    return this.outcomingRoutes.find((route) => route.endPointVertexId == endVertexId);
  }

  addIncomingRoutes(routes) {
    routes.forEach(route => {
      route.hasAssignedEndingWeight = false;
    });
    const foundRoutes = routes.filter((route) => {
      if (route.startPointVertexId === this.id & route.endPointVertexId === this.id) { return false; }
      const foundRoute = this.incomingRoutes.find((incomingRoute) => {
        return route.id === incomingRoute.id;
      });
      return foundRoute === undefined;
    });
    if (foundRoutes.length === 0) { return; }
    this.incomingRoutes = this.incomingRoutes.concat(foundRoutes);
    this.assignTotalWeights();
  }

  addOutcomingRoutes(routes) {
    routes.forEach(route => {
      route.hasAssignedStartingWeight = false;
    });
    const foundRoutes = routes.filter((route) => {
      if (route.startPointVertexId === this.id & route.endPointVertexId === this.id) { return false; }
      const foundRoute = this.outcomingRoutes.find((outcomingRoute) => {
        return route.id === outcomingRoute.id;
      });
      return foundRoute === undefined;
    });
    if (foundRoutes.length === 0) { return; }
    this.outcomingRoutes = this.outcomingRoutes.concat(foundRoutes);
    this.assignTotalWeights();
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