class Vertex {

  constructor(id, incomingRoutes, outcomingRoutes, parentRoute) {
    this.id = id;
    this.parentRoute = parentRoute;
    const incomingLocations = incomingRoutes.map((incomingRoute) => incomingRoute.end);
    const outcomingLocations =  outcomingRoutes.map((outcomingRoutes) => outcomingRoutes.start);
    if (outcomingLocations.length > 0) {
      this.centerLocation = outcomingLocations[0];
    } else {
      this.centerLocation = incomingLocations[0];
    }
    this.incomingRoutes = incomingRoutes === undefined ? [] : incomingRoutes;
    this.outcomingRoutes = outcomingRoutes === undefined ? [] : outcomingRoutes;

    this.assignVertexIds();
    this.generateLinkLists();
  }

  assignVertexIds() {
    this.incomingRoutes.forEach(route => route.endPointVertexId = this.id);
    this.outcomingRoutes.forEach(route => route.startPointVertexId = this.id);
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
    // const foundRoutes = routes.filter((route) => {
    //   let alreadyContains = this.incomingLinkList.includes(route.startPointVertexId);
    //   if (alreadyContains) {
    //     console.log('**********************************************');
    //     console.log('Ignoring added incoming, already exists');
    //     console.log(`Already existing incoming links: ${this.incomingLinkList}`);
    //     console.log(`Trying to add: ${route.endPointVertexId}`);
    //     console.log('**********************************************');
    //   }
    //   return alreadyContains;
    // });
    // if (foundRoutes.length === 0) { return; }
    this.incomingRoutes = this.incomingRoutes.concat(routes);
    this.assignVertexIds();
    this.generateLinkLists();
  }

  addOutcomingRoutes(routes) {
    // const foundRoutes = routes.filter((route) => {
    //   let alreadyContains = this.outcomingLinkList.includes(route.endPointVertexId);
    //   if (alreadyContains) {
    //     console.log('**********************************************');
    //     console.log('Ignoring added outcoming, already exists');
    //     console.log(`Already existing outcoming links: ${this.outcomingLinkList}`);
    //     console.log(`Trying to add: ${route.startPointVertexId}`);
    //     console.log('**********************************************');
    //   }
    //   return alreadyContains;
    // });
    // if (foundRoutes.length === 0) { return; }
    this.outcomingRoutes = this.outcomingRoutes.concat(routes);
    this.assignVertexIds();
    this.generateLinkLists();
  }

  assignBidirectional() {
    // Ignoring links, they are added bidirectional by design.
    const bidirectionalIncomingRoutes = this.incomingRoutes.filter((route) => route.bidirectional & !route.isLink);
    const bidirectionalOutcomingRoutes = this.outcomingRoutes.filter((route) => route.bidirectional & !route.isLink);
    
    // We concatenate all incoming routes to outcoming routes and opposite.
    this.addOutcomingRoutes(bidirectionalIncomingRoutes.map((route) => route.reversed()));
    this.addIncomingRoutes(bidirectionalOutcomingRoutes.map((route) => route.reversed()));
  }

  generateLinkLists() {
    this.outcomingLinkList = this.outcomingRoutes.filter(route => route.endPointVertexId !== 0).map(route => route.endPointVertexId);
    this.incomingLinkList = this.incomingRoutes.filter(route => route.startPointVertexId !== 0).map(route => route.startPointVertexId);
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