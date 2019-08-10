const LocationCoordinate = require('../utilities/locationCoordinate');

class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes) {
    this.id = id;
    this.incomingRoutes = incomingRoutes === undefined ? [] : incomingRoutes;
    this.outcomingRoutes = outcomingRoutes === undefined ? [] : outcomingRoutes;
    this.reloadCenterLocation();
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
      transformedRoutes[`${route.endPointVertexId}`] = route.totalLength;
    });
    return transformedRoutes;
  }

  debugDescription() {
    let transformedRoutes = {
      incoming: [],
      outcoming: []
    };
    this.outcomingRoutes.forEach((route) => {
      transformedRoutes.outcoming.push(route.debugDescription());
    });
    this.incomingRoutes.forEach((route) => {
      transformedRoutes.incoming.push(route.debugDescription());
    });
    return transformedRoutes;
  }
}

module.exports= Vertex;