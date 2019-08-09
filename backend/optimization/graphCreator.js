const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');

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

  createGraph() {
    this.routes.forEach((route) => {
      this.pushVertex(route, SEARCH_AROUND_START);
      this.pushVertex(route, SEARCH_AROUND_END);
    });
    this.extractNearbySegments();
    return this.vertices;
  };

  autoincrementedId() {
    this.currentId += 1;
    return this.currentId;
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
        if (outcomingRouteIds.includes(route.id) | incomingRouteIds.includes.route.id) { return; }
        // We eliminate routes that are to far away to be possibly near a given vertex.
        const distanceToRouteStart = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, route.start);
        const distanceToRouteEnd = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, route.end);
        if (distanceToRouteStart > routeNearVertexIgnoreDistance & distanceToRouteEnd > routeNearVertexIgnoreDistance) { return; }
        // We find the first segment that is near enough to the specified vertex. Works much faster than sorting and extracting first.
        const eligibleSegment = route.segments.find((segment) => {
          const distance = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, segment.start);
          return distance <= desiredDistanceThreshold;
        });
        if (eligibleSegment === undefined) { return }
        let distanceToClosest = distanceCalculation.distanceBetweenLocations(vertex.centerLocation, eligibleSegment.start);
        if (distanceToClosest > desiredDistanceThreshold) { return; }

      });
    });
  }

  pushVertex(route, searchType) {
      // Procedure for route starting vertex.
      // Performs search for all other routes that start nearby the given route.
      let incomingCloseToStart = this.findClosest(route, this.routes, desiredDistanceThreshold, SEARCH_INCOMING, searchType);
      let outcomingCloseToStart = this.findClosest(route, this.routes, desiredDistanceThreshold, SEARCH_OUTCOMING, searchType);

      // Check if any of incoming routes already are correlated with an existing node.
      // First create an array od routes that are already correlated with some vertex.
      let alreadyCorrelatedIncoming = incomingCloseToStart.filter((incomingRoute) => {
        return incomingRoute.markedEnd;
      });
      let alreadyCorrelatedOutcoming = outcomingCloseToStart.filter((outcomingRoute) => {
        return outcomingRoute.markedStart;
      });
      // Than create an array of routes that should be added without abandoning exisitng node.
      incomingCloseToStart = incomingCloseToStart.filter((incomingRoute) => {
        return !incomingRoute.markedEnd;
      });
      outcomingCloseToStart = outcomingCloseToStart.filter((outcomingRoute) => {
        return !outcomingRoute.markedStart;
      });

      // Handle routes that already belong to a vertex.
      // First extract vertex ids for both types.
      let correlatedIncomingVertexIds = alreadyCorrelatedIncoming.map((incomingRoute) => incomingRoute.endPointVertexId );
      let correlatedOutcomingVertexIds = alreadyCorrelatedOutcoming.map((outcomingRoute) => outcomingRoute.endPointVertexId );

      /// Than create an array of vertices that should be removed by concatenating both these arrays.
      let verticesToRemove = correlatedIncomingVertexIds.concat(correlatedOutcomingVertexIds);

      /// Than fetch all incoming and outcoming routes of the vertices that can be removed.
      let extractedOutcomingFromVertices = verticesToRemove.map((id) => { 
        return this.vertices.find((iteratedVertex) => iteratedVertex.id === id).outcomingNeighbors 
      });
      let extractedIncomingFromVertices = verticesToRemove.map((id) => { 
        return this.vertices.find((iteratedVertex) => iteratedVertex.id === id).incomingNeighbors 
      });

      // Append the current arrays with all routes extracted from destroyed vertices.
      incomingCloseToStart = incomingCloseToStart.concat(extractedIncomingFromVertices);
      outcomingCloseToStart = outcomingCloseToStart.concat(extractedOutcomingFromVertices);

      // Actually remove all the vertices that were replaced by the new ones.
      this.vertices = this.vertices.filter((vertex) => {
        return !verticesToRemove.includes(vertex.id);
      });

      // Create new vertex with all gathered data and append it to vertices prop.
      const vertex = new Vertex(this.autoincrementedId(), incomingCloseToStart, outcomingCloseToStart);
      this.vertices.push(vertex);
  }

  /**
   * Finds all the routes that are in the given distance of the end or start of the given route.
   * Query depends on the type passed, can be SEARCH_AROUND_START or SEARCH_AROUND_END.
   * Additionally searches for for incoming or outcoming routes, based on directionType passed. Can be SEARCH_INCOMING or SEARCH_OUTCOMING.
   */
  findClosest(route, routes, distanceThreshold, directionType, searchType) {
    let baseLocation = searchType === SEARCH_AROUND_START ? route.start : route.end;
    return routes.filter((filteredRoute) => {
      if (filteredRoute.bidirectional) {
        let distanceToStart = distanceCalculation.distanceBetweenLocations(baseLocation, filteredRoute.start);
        let distanceToEnd = distanceCalculation.distanceBetweenLocations(baseLocation, filteredRoute.end);
        return distanceToStart <= distanceThreshold | distanceToEnd <= distanceThreshold;
      }
      let searchedLocation = directionType === SEARCH_INCOMING ? filteredRoute.end : filteredRoute.start;
      const distance = distanceCalculation.distanceBetweenLocations(baseLocation, searchedLocation);
      return distance <= distanceThreshold;
    });
  }
}

module.exports = GraphCreator;