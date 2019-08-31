const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');
const Route = require('../utilities/routeModel');
const Segment = require('../utilities/segment');
var uuidv4 = require('../utilities/UUIDGenerator');

const isolatedVerticesLinkingThreshold = 150;

const desiredNearbyDistanceThreshold = 50;

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
    console.log(`Child routes amount: ${this.childRoutes.length}`);
    console.log(`Vertices count: ${this.vertices.length}`);
    var end = new Date() - start;
    console.info('Route ending association time: %dms', end);
    this.extractNearbyVertices();
    end = new Date() - start;
    console.info('Nearby vertices extraction time: %dms', end);
    end = new Date() - start;
    console.log(`Total vertices before removing links: ${this.vertices.length}`);
    this.removeLinkingVertices();
    this.removeLinkingVertices();
    this.removeLinkingVertices();
    console.info('Linking routes remove time: %dms', end);
    console.log(`Total vertices after removing links: ${this.vertices.length}`);
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
        this.addSingleVertex([], [route], parentRoute);
        previousVertex = this.addSingleVertex([route], [], parentRoute);
        index = 1;
        return
      }
      if (index === 1) {
        previousVertex.addOutcomingRoutes([route]);
      }
      if (index === parentRoute.children.length - 1) {
        this.addSingleVertex([route], [], parentRoute);
        return;
      }
      let nextRoute = parentRoute.children[index + 1];
      previousVertex = this.addSingleVertex([route], [nextRoute], parentRoute);
      index += 1;
    }); 
  };

  assignBidirectional() {
    // let count = 0;
    this.vertices.forEach((vertex) => {
      // count += 1;
      // console.log(`Working on vertex: ${count}`);
      vertex.assignBidirectional();
    });
  }

  removeLinkingVertices() {
    let toRemove = [];
    this.vertices.forEach(vertex => {
      if (vertex.incomingRoutes.length !== 1 | vertex.outcomingRoutes.length !== 1) { return; };
      toRemove.push(vertex);
      let incoming = vertex.incomingRoutes[0];
      let outcoming = vertex.outcomingRoutes[0];
      let merged = incoming.mergeWith(outcoming);
      incoming.startVertex.addOutcomingRoutes([merged]);
      outcoming.endVertex.addIncomingRoutes([merged]);
      outcoming.endVertex.removeIncomingRoute(outcoming);
      incoming.startVertex.removeOutcomingRoute(incoming);
    });
    this.vertices = this.vertices.filter(vertex => !toRemove.includes(vertex));
  }

  addSingleVertex(incomingRoutes, outcomingRoutes, parentRoute) {
    const vertexId = this.autoincrementedId();
    const vertex = new Vertex(vertexId, incomingRoutes, outcomingRoutes, parentRoute);
    this.vertices.push(vertex);
    return vertex;
  }

  extractNearbyVertices() {
    let count = 0;
    this.vertices.forEach(vertex => {
      let nearbyVertices = this.vertices.filter(iteratedVertex => {
        if (iteratedVertex.parentRoute.id === vertex.parentRoute.id | vertex === iteratedVertex) { return false; }
        if (Math.abs(iteratedVertex.centerLocation.latitude - vertex.centerLocation.latitude) > 0.002 | Math.abs(iteratedVertex.centerLocation.longitude - vertex.centerLocation.longitude) > 0.002) { 
          return false; 
        }
        const distance = distanceCalculation.distanceBetweenLocations(iteratedVertex.centerLocation, vertex.centerLocation);
        return distance < desiredNearbyDistanceThreshold;
      });
      nearbyVertices.forEach(iteratedVertex => {
        this.linkVertices(vertex, iteratedVertex);
        count += 1;
      });
    });
    console.log(`Links amount: ${count}`);
  }

  linkVertices(startVertex, endVertex) {
    let linkSegment = new Segment([startVertex.centerLocation.longitude, startVertex.centerLocation.latitude, endVertex.centerLocation.longitude, endVertex.centerLocation.latitude], 'standard_link');
    let route = new Route(uuidv4(), "standard_link", "standard_link", [linkSegment], false);
    endVertex.addIncomingRoutes([route]);
    startVertex.addOutcomingRoutes([route]);
  }

  linkIsolatedVertices() {
      this.vertices.forEach(vertex => {
        if (vertex.outcomingRoutes.length > 1) { return; }
        let nearbyVertices = this.vertices.filter(iteratedVertex => {
          if (iteratedVertex === vertex | iteratedVertex.parentRoute.id === vertex.parentRoute.id) { return false; }
          const distance = distanceCalculation.distanceBetweenLocations(iteratedVertex.centerLocation, vertex.centerLocation);
          return distance < isolatedVerticesLinkingThreshold
        });
        nearbyVertices.forEach(iteratedVertex => {
          if (iteratedVertex === vertex | iteratedVertex.parentRoute.id === vertex.parentRoute.id) { return false; }
          let linkSegment = new Segment([iteratedVertex.centerLocation.longitude, iteratedVertex.centerLocation.latitude, vertex.centerLocation.longitude, vertex.centerLocation.latitude], 'isolation_link');
          let route = new Route(uuidv4(), "isolation_link", "isolation_link", [linkSegment], false);
          iteratedVertex.addIncomingRoutes([route]);
          vertex.addOutcomingRoutes([route]);
          // console.log(`Found isolated, linking ${iteratedVertex.parentRoute.name} with ${vertex.parentRoute.name}`);
        });
      });
  }
}

module.exports = GraphCreator;