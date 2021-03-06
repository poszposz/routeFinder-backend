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
    console.log(`Total vertices after removing links: ${this.vertices.length}`);
    console.info('Linking routes remove time: %dms', end);
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
        previousVertex = this.addSingleVertex([route], [], parentRoute, true, false);
        index = 1;
        return
      }
      if (index === 1) {
        previousVertex.addOutcomingRoutes([route]);
      }
      if (index === parentRoute.children.length - 1) {
        this.addSingleVertex([route], [], parentRoute, false, true);
        return;
      }
      let nextRoute = parentRoute.children[index + 1];
      previousVertex = this.addSingleVertex([route], [nextRoute], parentRoute, false, false);
      index += 1;
    }); 
  };

  assignBidirectional() {
    this.vertices.forEach((vertex) => {
      vertex.assignBidirectional();
    });
  }

  removeLinkingVertices() {
    let toRemove = [];
    this.vertices.forEach(vertex => {
      if (vertex.incomingRoutes.length !== 1 | vertex.outcomingRoutes.length !== 1 | vertex.isMerged) { return; };
      toRemove.push(vertex);
      let incoming = vertex.incomingRoutes[0];
      let outcoming = vertex.outcomingRoutes[0];
      let merged = incoming.mergeWith(outcoming);
      incoming.startVertex.addOutcomingRoutes([merged]);
      outcoming.endVertex.addIncomingRoutes([merged]);

      incoming.startVertex.isMerged = true;
      outcoming.endVertex.isMerged = true;

      outcoming.endVertex.removeIncomingRoute(outcoming);
      incoming.startVertex.removeOutcomingRoute(incoming);
    });
    this.vertices = this.vertices.filter(vertex => !toRemove.includes(vertex));
  }

  addSingleVertex(incomingRoutes, outcomingRoutes, parentRoute, isRouteStarting, isRouteEnding) {
    const vertexId = this.autoincrementedId();
    const vertex = new Vertex(vertexId, incomingRoutes, outcomingRoutes, parentRoute, isRouteStarting, isRouteEnding);
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
        if (iteratedVertex.parentRoute.isBridge & !(iteratedVertex.isRouteStarting | iteratedVertex.isRouteEnding)) { 
          return; 
        }
        if (vertex.parentRoute.isBridge & !(vertex.isRouteStarting | vertex.isRouteEnding)) { 
          return; 
        }
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
        });
      });
  }
}

module.exports = GraphCreator;