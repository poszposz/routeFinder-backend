const LocationCoordinate = require('../utilities/locationCoordinate');

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

  generateOutcomingRoutes() {
    let transformedRoutes = {};
    this.outcomingRoutes.forEach((route) => {
      transformedRoutes[`${route.endPointVertexId}`] = route.totalLength;
    });
    return transformedRoutes;
  }
}

module.exports= Vertex;