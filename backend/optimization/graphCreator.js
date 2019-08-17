const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');
const Route = require('../utilities/routeModel');
var uuidv4 = require('../utilities/UUIDGenerator');

const SEARCH_AROUND_START = "SEARCH_AROUND_START";
const SEARCH_AROUND_END = "SEARCH_AROUND_END";

const SEARCH_INCOMING = "SEARCH_INCOMING";
const SEARCH_OUTCOMING = "SEARCH_OUTCOMING";

const desiredDistanceThreshold = 30;

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
        incomingRoute.endPointVertexId = alreadyExistingVertex.id;
        alreadyExistingVertex.addIncomingRoutes([incomingRoute]);
      });

      outcomingRoutes.forEach((outcomingRoute) => {
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
        // We ignore all the routes that starts or ends in currently iterated vertex.
        if (route.startPointVertexId === vertex.id | route.endPointVertexId === vertex.id) { return; }
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
        let prefixedSegments = splitted[1];
        let suffixedSegments = splitted[0];
        if (prefixedSegments.length === 0 | suffixedSegments.length === 0) { return; }
        // We have to create two routes from prefixed and suffixed segments.
        let prefixedRoute = new Route(uuidv4(), route.name, route.category, prefixedSegments);
        let suffixedRoute = new Route(uuidv4(), route.name, route.category, suffixedSegments);
        // To that point all should be good.
        
        // We have to find a vertices this route is starting and ending with.
        let startVertex = this.vertices.find((vertex) => vertex.id === route.startPointVertexId);
        let endVertex = this.vertices.find((vertex) => vertex.id === route.endPointVertexId);

        // We assign properly the starting and endings for prefixed and suffixed routes.
        prefixedRoute.startPointVertexId = startVertex.id;
        prefixedRoute.endPointVertexId = vertex.id;
        suffixedRoute.startPointVertexId = vertex.id;
        suffixedRoute.endPointVertexId = endVertex.id;

        // We properly add the newly created routes to starting, ending and middle vertices.
        startVertex.addOutcomingRoutes([prefixedRoute]);
        endVertex.addIncomingRoutes([suffixedRoute]);
        vertex.addIncomingRoutes([prefixedRoute]);
        vertex.addOutcomingRoutes([suffixedRoute]);
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