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
  }

  createGraph() {
    this.routes.forEach((route) => {
      this.pushVertex(route, SEARCH_AROUND_START);
      this.pushVertex(route, SEARCH_AROUND_END);
    });
    this.extractNearbySegments();
    return this.vertices;
  };

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
        // Basing on the information if a given route is bidirectional: 
        // - append prefixedRoute to outcoming routes of the start vertex of a general route.
        // - append prefixedRoute to incoming and outcoming routes of the start vertex of a general route.
        if (prefixedRoute.isBidirectional) {
          startVertex.outcomingRoutes = startVertex.outcomingRoutes.concat(prefixedRoute);
          startVertex.incomingRoutes = startVertex.incomingRoutes.concat(prefixedRoute);
        } else {
          startVertex.outcomingRoutes = startVertex.outcomingRoutes.concat(prefixedRoute);
        }
        // We have to find a vertex this route is ending with.
        let endVertex = this.vertices.find((vertex) => vertex.id === route.endPointVertexId);
        // Basing on the information if a given route is bidirectional: 
        // - append prefixedRoute to incoming routes of the start vertex of a general route.
        // - append prefixedRoute to incoming and outcoming routes of the start vertex of a general route.
        if (prefixedRoute.isBidirectional) {
          endVertex.outcomingRoutes = startVertex.outcomingRoutes.concat(suffixedRoute);
          endVertex.incomingRoutes = startVertex.incomingRoutes.concat(suffixedRoute);
        } else {
          endVertex.incomingRoutes = startVertex.outcomingRoutes.concat(suffixedRoute);
        }
        // Now we have to add prefixed and sufixed route to the current vertex.
        // Basing on the information if a given route is bidirectional: 
        // - append prefixed to incoming and sufixed to outcoming.
        // - append prefixed to incoming and outcoming, append suffixed to incoming and outcoming.
        if (route.isBidirectional) {
          vertex.outcomingRoutes = vertex.outcomingRoutes.concat(prefixedRoute);
          vertex.incomingRoutes = vertex.incomingRoutes.concat(prefixedRoute);
          vertex.outcomingRoutes = vertex.outcomingRoutes.concat(suffixedRoute);
          vertex.incomingRoutes = vertex.incomingRoutes.concat(suffixedRoute);
        } else {
          vertex.incomingRoutes = vertex.incomingRoutes.concat(prefixedRoute);
          vertex.outcomingRoutes = vertex.outcomingRoutes.concat(suffixedRoute);
        }
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
      let correlatedOutcomingVertexIds = alreadyCorrelatedOutcoming.map((outcomingRoute) => outcomingRoute.startPointVertexId );

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
      const vertexId = uuidv4();
      const vertex = new Vertex(vertexId, incomingCloseToStart, outcomingCloseToStart);
      this.vertices.push(vertex);
      incomingCloseToStart.forEach((incomingRoute) => {
        incomingRoute.endPointVertexId = vertexId;
      });
      outcomingCloseToStart.forEach((outcomingRoute) => {
        outcomingRoute.startPointVertexId = vertexId;
      });
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