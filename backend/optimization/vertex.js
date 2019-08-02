class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes) {
    this.id = id;
    this.incomingRoutes = incomingRoutes === undefined ? [] : incomingRoutes;
    this.outcomingRoutes = outcomingRoutes === undefined ? [] : outcomingRoutes;
  }
}

module.exports= Vertex;