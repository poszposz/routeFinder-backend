var createGraph = require('ngraph.graph');
const GraphCreator = require('./graphCreator');
const distanceCalculation = require('./../utilities/distanceCalculation');

const maximumVertexSearchRadius = 300;

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

  generateDijkstraQuery() {
    let transformedGraph = {};
    this.vertices.forEach((vertex) => {
      transformedGraph[vertex.id] = vertex.generateOutcomingRoutes();
    });
    return transformedGraph;
  }

  nearestStartVertices(location) {
    const possibleStartVertices = this.vertices.filter((vertex) => {
      return vertex.outcomingRoutes.length > 0
    });
    return this.nearestVertices(possibleStartVertices, location);
  }

  nearestEndVertices(location) {
    const possibleEndVertices = this.vertices.filter((vertex) => {
      return vertex.incomingRoutes.length > 0
    });
    return this.nearestVertices(possibleEndVertices, location);
  }

  nearestVertices(vertices, location) {
    const sorted = vertices.sort((first, second) => {
      const firstDistance = distanceCalculation.distanceBetweenLocations(location, first.centerLocation);
      const secondDistance = distanceCalculation.distanceBetweenLocations(location, second.centerLocation);
      return firstDistance - secondDistance;
    });
    if (sorted.length > 0) {
      let best = sorted[0];
      let filtered = sorted.filter((vertex) => distanceCalculation.distanceBetweenLocations(best.centerLocation, vertex.centerLocation) < maximumVertexSearchRadius);
      return filtered.map((vertex) => {
        return {
          'vertex': vertex,
          'reachDistance': distanceCalculation.distanceBetweenLocations(vertex.centerLocation, location) 
        };
      });
    }
    return null;
  }

  parseDijkstraResult(results) {
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
      [vertex.incomingRoutes, vertex.outcomingRoutes].flatten().forEach((route) => {
        graph.addLink(route.startPointVertexId, route.endPointVertexId, {weight: route.totalWeight});
      });
    })
    return graph;
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