class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes) {
    this.id = id;
    this.incomingRoutes = incomingRoutes;
    this.outcomingRoutes = outcomingRoutes;
  }
}

module.exports= Vertex;