const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');
const Route = require('../utilities/routeModel');
const Segment = require('../utilities/segment');
var uuidv4 = require('../utilities/UUIDGenerator');

const isolatedVerticesLinkingThreshold = 150;

const desiredNearbyDistanceThreshold = 30;

class GraphCreator {

  constructor(routes) {
    console.log(`All routes: ${routes.length}`);
    this.routes = routes;
    this.childRoutes = routes.map(route => route.children).flatten();
    this.vertices = [];
    this.currentId = 1;
  }

  autoincrementedId() {
    this.currentId += 1;
    return this.currentId;
  }

  createGraph() {
    var start = new Date();
    this.routes.forEach((route) => {
      this.createInRouteVertices(route);
    });
    var end = new Date() - start;
    console.info('Route ending association time: %dms', end);
    this.extractNearbyVertices();
    console.log(`Vertices count after extraction: ${this.vertices.length}`);
    end = new Date() - start;
    console.info('Nearby vertices extraction time: %dms', end);
    this.assignBidirectional();
    end = new Date() - start;
    console.info('Bidirectional routes assignment time: %dms', end);
    this.linkIsolatedVertices();
    end = new Date() - start;
    console.info('Graph total creation time: %dms', end);
    return this.vertices;
  };

  createInRouteVertices(parentRoute) {
    let index = 0;
    let previousVertex;
    parentRoute.children.forEach((route) => {
      if (index === 0) {
        let startingVertex = this.addSingleVertex([], [route], parentRoute.id);
        let endingVertex = this.addSingleVertex([route], [], parentRoute.id);
        parentRoute.startPointVertexId = startingVertex.id;
        if (parentRoute.children.length === 1) {
          parentRoute.endPointVertexId = endingVertex.id;
          // endingVertex.addIncomingRoutes([parentRoute]);
        }
        // startingVertex.addOutcomingRoutes([parentRoute]);
        previousVertex = endingVertex;
        index = 1;
        return
      }
      if (index === parentRoute.children.length - 1) {
        let vertex = this.addSingleVertex([route], [], parentRoute.id);
        route.startPointVertexId = previousVertex.id;
        parentRoute.endPointVertexId = vertex.id;
        // vertex.addIncomingRoutes([parentRoute]);
        return;
      }
      let nextRoute = parentRoute.children[index + 1];
      previousVertex = this.addSingleVertex([route], [nextRoute], parentRoute.id);
      if (index === 1) {
        route.startPointVertexId = previousVertex.id;
      }
      index += 1;
    }); 
  };

  assignBidirectional() {
    this.vertices.forEach((vertex) => {
      // We find all bidirectional routes coming in a nd out from a given vertex.
      const bidirectionalIncomingRoutes = vertex.incomingRoutes.filter((route) => route.bidirectional);
      const bidirectionalOutcomingRoutes = vertex.outcomingRoutes.filter((route) => route.bidirectional);
      
      // We concatenate all incoming routes to outcoming routes and opposite.
      vertex.addOutcomingRoutes(bidirectionalIncomingRoutes.map((route) => route.reversed()));
      vertex.addIncomingRoutes(bidirectionalOutcomingRoutes.map((route) => route.reversed()));
    });
  }

  /**
   * Adds a single vertex with given incoming and outcoming routes. 
   * Additionally checks if there is a vertex within desiredDistanceThreshold, if so, appends it with given routes.
   */
  addSingleVertex(incomingRoutes, outcomingRoutes, parentRouteId) {
    // Create new vertex with all gathered data and append it to vertices prop.
    const vertexId = this.autoincrementedId();
    const vertex = new Vertex(vertexId, incomingRoutes, outcomingRoutes, parentRouteId);
    this.vertices.push(vertex);
    incomingRoutes.forEach((incomingRoute) => {
      incomingRoute.endPointVertexId = vertexId;
    });
    outcomingRoutes.forEach((outcomingRoute) => {
      outcomingRoute.startPointVertexId = vertexId;
    });
    return vertex;
  }

  extractNearbyVertices() {
    let count = 0;
    this.vertices.forEach(vertex => {
      let nearbyVertices = this.vertices.filter(iteratedVertex => {
        if (iteratedVertex.parentRouteId === vertex.parentRouteId | vertex === iteratedVertex) { return false; }
        if (Math.abs(iteratedVertex.centerLocation.latitude - vertex.centerLocation.latitude) > 0.001 | Math.abs(iteratedVertex.centerLocation.longitude - vertex.centerLocation.longitude) > 0.001) { 
          return false; 
        }
        const distance = distanceCalculation.distanceBetweenLocations(iteratedVertex.centerLocation, vertex.centerLocation);
        return distance < desiredNearbyDistanceThreshold;
      });
      nearbyVertices.forEach(iteratedVertex => {
        count += 1;
        console.log(`Created route: ${count}, between: ${vertex.id} and ${iteratedVertex.id}`);
        // console.log(`Created route: ${count}`);
        this.linkVertices(vertex, iteratedVertex);
      });
    });
  }

  linkVertices(startVertex, endVertex) {
    let linkSegment = new Segment([startVertex.centerLocation.longitude, startVertex.centerLocation.latitude, endVertex.centerLocation.longitude, endVertex.centerLocation.latitude], 'standard_link');
    let route = new Route(uuidv4(), "standard_link", "standard_link", [linkSegment], false);
    endVertex.addIncomingRoutes([route]);
    route.startPointVertexId = startVertex.id;
    route.endPointVertexId = endVertex.id;
    startVertex.addOutcomingRoutes([route]);
  }

  linkIsolatedVertices() {
      this.vertices.forEach(vertex => {
        if (vertex.incomingRoutes.length > 1 | vertex.outcomingRoutes.length > 1) { return; }
        let nearbyVertices = this.vertices.filter(iteratedVertex => {
          if (iteratedVertex === vertex | iteratedVertex.parentRouteId === vertex.parentRouteId) { return false; }
          const distance = distanceCalculation.distanceBetweenLocations(iteratedVertex.centerLocation, vertex.centerLocation);
          return distance < isolatedVerticesLinkingThreshold
        });
        if (nearbyVertices.length > 6) { return; }
        console.log('Assigning isolated vertex');
        nearbyVertices.forEach(iteratedVertex => {
          if (iteratedVertex === vertex | iteratedVertex.parentRouteId === vertex.parentRouteId) { return false; }
          let linkSegment = new Segment([iteratedVertex.centerLocation.longitude, iteratedVertex.centerLocation.latitude, vertex.centerLocation.longitude, vertex.centerLocation.latitude], 'isolation_link');
          let route = new Route(uuidv4(), "isolation_link", "isolation_link", [linkSegment], false);
          iteratedVertex.addIncomingRoutes([route]);
          route.startPointVertexId = vertex.id;
          route.endPointVertexId = iteratedVertex.id;
          vertex.addOutcomingRoutes([route]);
        });
      });
  }
}

module.exports = GraphCreator;