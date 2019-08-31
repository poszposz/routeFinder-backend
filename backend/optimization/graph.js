var createGraph = require('ngraph.graph');
const GraphCreator = require('./graphCreator');
const distanceCalculation = require('./../utilities/distanceCalculation');

class Graph {

  constructor(routes) {
    const graphCreator = new GraphCreator(routes);
    this.vertices = graphCreator.createGraph();
  }

  generateGraphVisualization() {
    return {
      'vertices': this.vertices
    };
  }

  nearestStartVertices(location) {
    const possibleStartVertices = this.vertices.filter((vertex) => {
      return vertex.outcomingRoutes.length > 0
    });
    return this.nearestVertices(possibleStartVertices, location);
  }

  nearestEndVertices(location) {
    return this.nearestVertices(this.vertices, location);
  }

  nearestVertices(vertices, location) {
    const sorted = vertices.sort((first, second) => {
      const firstDistance = distanceCalculation.distanceBetweenLocations(location, first.centerLocation);
      const secondDistance = distanceCalculation.distanceBetweenLocations(location, second.centerLocation);
      return firstDistance - secondDistance;
    });
    const parentRouteIds = [];
    const sortedUniqueParentRouteIds = sorted.filter(vertex => {
      if (parentRouteIds.includes(vertex.id)) { return false; }
      parentRouteIds.push(vertex.id);
      return true;
    });
    if (sortedUniqueParentRouteIds.length > 0) {
      let best = sortedUniqueParentRouteIds[0];
      let slice = sortedUniqueParentRouteIds.slice(0, 3);
      return slice.map((vertex) => {
        return {
          'isBest': (vertex === best),
          'vertex': vertex,
          'reachDistance': distanceCalculation.distanceBetweenLocations(vertex.centerLocation, location) 
        };
      });
    }
    return null;
  }

  parseOptimizationResult(results) {
    let count = 0;
    return results.map((vertexId) => {
      if (count === results.count - 2) { return null; }
      let nextVertexId = results[count + 1];
      let vertex = this.vertices.find((vertex) => vertex.id == vertexId);
      let route = vertex.findRouteTo(nextVertexId);
      count += 1;
      return route;
    }).filter((route) => route != null);
  }

  genrateAStarGraph() {
    var graph = createGraph();
    this.vertices.forEach(vertex => {
      graph.addNode(vertex.id, {vertex: vertex});
      [vertex.outcomingRoutes].flatten().forEach((route) => {
        graph.addLink(route.startPointVertexId, route.endPointVertexId, {weight: route.weight});
      });
    })
    return graph;
  }

  generateDijkstraQuery() {
    let transformedGraph = {};
    this.vertices.forEach((vertex) => {
      transformedGraph[vertex.id] = vertex.generateOutcomingRoutes();
    });
    return transformedGraph;
  }

  debugDescription() {
    let transformedGraph = {};
    this.vertices.forEach((vertex) => {
      transformedGraph[vertex.id] = vertex.debugDescription();
    });
    return transformedGraph;
  }
}

module.exports = Graph;