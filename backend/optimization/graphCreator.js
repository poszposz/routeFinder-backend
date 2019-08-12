const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');
const Route = require('../utilities/routeModel');
var uuidv4 = require('../utilities/UUIDGenerator');

const SEARCH_AROUND_START = "SEARCH_AROUND_START";
const SEARCH_AROUND_END = "SEARCH_AROUND_END";

const SEARCH_INCOMING = "SEARCH_INCOMING";
const SEARCH_OUTCOMING = "SEARCH_OUTCOMING";

const desiredDistanceThreshold = 100;

const routeNearVertexIgnoreDistance = 800;

class GraphCreator {

  constructor(routes) {
    this.routes = routes;
    this.vertices = [];
    this.currentId = 1;
  }

  autoincrementedId() {
    this.currentId += 1;
    return this.currentId;
  }

  createGraph() {
    this.routes.forEach((route) => {
      this.pushVertex(route, SEARCH_AROUND_START);
      this.pushVertex(route, SEARCH_AROUND_END);
    });
    this.extractNearbySegments();
    this.assignBidirectional();
    this.reassignVertexIds();
    return this.vertices;
  };

  assignBidirectional() {
    this.vertices.forEach((vertex) => {
      // We find all bidirectional routes coming in a nd out from a given vertex.
      const bidirectionalIncomingRoutes = vertex.incomingRoutes.filter((route) => route.bidirectional);
      const bidirectionalOutcomingRoutes = vertex.outcomingRoutes.filter((route) => route.bidirectional);
      
      // We concatenate all incoming routes to outcoming routes and opposite.
      vertex.addOutcomingRoutes(bidirectionalIncomingRoutes.map((route) => route.reversed()));
      vertex.addIncomingRoutes(bidirectionalOutcomingRoutes.map((route) => route.reversed()));

      // For all bidirectional incoming routes we iterate, find starting vertex and add their begginings as outcoming to the start vertex.
      bidirectionalIncomingRoutes.forEach((route) => {
        let startingVertex = this.vertices.find((iteratedVertex) => iteratedVertex.id === route.startPointVertexId);
        startingVertex.addIncomingRoutes([route.reversed()]);
        startingVertex.addOutcomingRoutes([route]);
      });
      // And we do the same thing with the opposite.
      bidirectionalOutcomingRoutes.forEach((route) => {
        let endingVertex = this.vertices.find((iteratedVertex) => iteratedVertex.id === route.endPointVertexId);
        endingVertex.addIncomingRoutes([route.reversed()]);
        endingVertex.addOutcomingRoutes([route]);
      });
    });
  }

  reassignVertexIds() {
    this.vertices = this.vertices.map((vertex) => {
      vertex.outcomingRoutes = vertex.outcomingRoutes.map((route) => {
        route.startPointVertexId = vertex.id;
        return route;
      });
      vertex.incomingRoutes = vertex.incomingRoutes.map((route) => {
        route.endPointVertexId = vertex.id;
        return route;
      });
      return vertex;
    });
  }

  /**
   * Adds a single vertex with given incoming and outcoming routes. 
   * Additionally checks if there is a vertex within desiredDistanceThreshold, if so, appends it with given routes.
   */
  addSingleVertex(incomingRoutes, outcomingRoutes) {
    // Create new vertex with all gathered data and append it to vertices prop.
    const vertexId = this.autoincrementedId();
    const vertex = new Vertex(vertexId, incomingRoutes, outcomingRoutes);

    // We fin a vertex that is already nerby a vertex that we are about to add.
    const alreadyExistingVertex = this.vertices.find((iteratedVertex) => {
      const distance = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, iteratedVertex.centerLocation);
      return distance < desiredDistanceThreshold;
    });
    if (alreadyExistingVertex === undefined) {
      this.vertices.push(vertex);
      incomingRoutes.forEach((incomingRoute) => {
        incomingRoute.endPointVertexId = vertexId;
      });
      outcomingRoutes.forEach((outcomingRoute) => {
        outcomingRoute.startPointVertexId = vertexId;
      });
    } else {
      incomingRoutes.forEach((incomingRoute) => {
        const alreadyExisitngIncomingRoute = alreadyExistingVertex.incomingRoutes.find((incomingVertexRoute) => incomingVertexRoute.id === incomingRoute.id);
        if (alreadyExisitngIncomingRoute !== undefined) { return; }
        incomingRoute.endPointVertexId = alreadyExistingVertex.id;
        alreadyExistingVertex.addIncomingRoutes([incomingRoute]);
      });

      outcomingRoutes.forEach((outcomingRoute) => {
        const alreadyExisitngOutcomingRoute = alreadyExistingVertex.outcomingRoutes.find((outcomingVertexRoute) => outcomingVertexRoute.id === outcomingRoutes.id);
        if (alreadyExisitngOutcomingRoute !== undefined) { return; }
        outcomingRoute.startPointVertexId = alreadyExistingVertex.id;
        alreadyExistingVertex.addOutcomingRoutes([outcomingRoute]);
      });
      alreadyExistingVertex.reloadCenterLocation();
    }
  }

  extractNearbySegments() {    
    // We have all segments from routes. Now we have to iterate via all vertices.
    // We have to iterate through all routes and for each of them find a segment that is closest to the vertex.
    this.vertices.forEach((vertex) => {
      this.routes.forEach((route) => {
        // We eliminate all routes that are incoming or outcoming from a currently iterated vertex.
        // They can have very short first segments and create false data.
        const outcomingRouteIds = vertex.outcomingRoutes.map((route) => route.id );
        const incomingRouteIds = vertex.incomingRoutes.map((route) => route.id );
        if (outcomingRouteIds.includes(route.id) | incomingRouteIds.includes(route.id)) { return; }
        // We eliminate routes that are to far away to be possibly near a given vertex.
        const distanceToRouteStart = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, route.start);
        const distanceToRouteEnd = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, route.end);
        if (distanceToRouteStart > routeNearVertexIgnoreDistance & distanceToRouteEnd > routeNearVertexIgnoreDistance) { return; }
        // We find the first segment that is near enough to the specified vertex. Works much faster than sorting and extracting first.
        const eligibleSegment = route.segments.find((segment) => {
          const distance = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, segment.start);
          return distance <= desiredDistanceThreshold;
        });
        // If none found, just return from the method.
        if (eligibleSegment === undefined) { return; }
        // We split the currently iterated route via given segment.
        let splitted = route.splitBy(eligibleSegment);
        let prefixedSegments = splitted[0];
        let suffixedSegments = splitted[1];
        if (prefixedSegments.length === 0 | suffixedSegments.length === 0) { return; }
        // We have to create two routes from prefixed and suffixed segments.
        let prefixedRoute = new Route(uuidv4(), route.name, route.category, prefixedSegments);
        let suffixedRoute = new Route(uuidv4(), route.name, route.category, suffixedSegments);
        
        // We have to find a vertex this route is starting with.
        let startVertex = this.vertices.find((vertex) => vertex.id === route.startPointVertexId);
        // Append prefixedRoute to outcoming routes of the start vertex of a general route.
        prefixedRoute.startPointVertexId = startVertex.id;
        startVertex.outcomingRoutes = startVertex.outcomingRoutes.concat(prefixedRoute);
        // We have to find a vertex this route is ending with.
        let endVertex = this.vertices.find((vertex) => vertex.id === route.endPointVertexId);
        // Append prefixedRoute to incoming routes of the start vertex of a general route.
        suffixedRoute.endPointVertexId = endVertex.id;
        endVertex.incomingRoutes = startVertex.outcomingRoutes.concat(suffixedRoute);
        // Now we have to add prefixed and sufixed route to the current vertex.
        // Append prefixed to incoming and sufixed to outcoming.
        prefixedRoute.endPointVertexId = vertex.id;
        vertex.addIncomingRoutes([prefixedRoute]);
        suffixedRoute.startPointVertexId = vertex.id;
        vertex.addIncomingRoutes([suffixedRoute]);
      });
    });
  }

  pushVertex(route, searchType) {
      // Procedure for route starting vertex.
      // Performs search for all other routes that start nearby the given route.
      let incomingCloseToStart = this.findClosest(route, this.routes, desiredDistanceThreshold, SEARCH_INCOMING, searchType);
      let outcomingCloseToStart = this.findClosest(route, this.routes, desiredDistanceThreshold, SEARCH_OUTCOMING, searchType);

      this.addSingleVertex(incomingCloseToStart, outcomingCloseToStart);
  }

  /**
   * Finds all the routes that are in the given distance of the end or start of the given route.
   * Query depends on the type passed, can be SEARCH_AROUND_START or SEARCH_AROUND_END.
   * Additionally searches for for incoming or outcoming routes, based on directionType passed. Can be SEARCH_INCOMING or SEARCH_OUTCOMING.
   */
  findClosest(route, routes, distanceThreshold, directionType, searchType) {
    let baseLocation = searchType === SEARCH_AROUND_START ? route.start : route.end;
    return routes.filter((filteredRoute) => {
      let searchedLocation = directionType === SEARCH_INCOMING ? filteredRoute.end : filteredRoute.start;
      const distance = distanceCalculation.distanceBetweenLocations(baseLocation, searchedLocation);
      return distance <= distanceThreshold;
    });
  }
}

module.exports = GraphCreator;