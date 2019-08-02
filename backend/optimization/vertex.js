const LocationCoordinate = require('../utilities/locationCoordinate');

class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes) {
    this.id = id;
    this.incomingRoutes = incomingRoutes === undefined ? [] : incomingRoutes;
    this.outcomingRoutes = outcomingRoutes === undefined ? [] : outcomingRoutes;

    const incomingLocations = incomingRoutes.map((incomingRoute) => incomingRoute.end);
    const outcomingLocations =  outcomingRoutes.map((outcomingRoutes) => outcomingRoutes.start);
    const allLocations = incomingLocations.concat(outcomingLocations);
    
    let length = allLocations.length !== 0 ? allLocations.length : 1;
    const latitudeAverage = allLocations.reduce(((accumulator, current) => accumulator + current.latitude), 0) / length;
    const longitudeAverage = allLocations.reduce((accumulator, current) => accumulator + current.longitude) / allLocations.length;
    this.centerLocation = new LocationCoordinate(latitudeAverage, longitudeAverage);
  }
}

module.exports= Vertex;