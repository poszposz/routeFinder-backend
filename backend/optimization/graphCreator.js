const distanceBetweenLocations = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');

const desiredDistanceThreshold = 50;

function createGraph(routes) {
  let vertices = [];
  let id = 1;
  routes.forEach((route) => {
    let removeableVertexIds = [];
    let extractedIncomingNeighbors = [];
    let extractedOutcomingNeighbors = [];
    const outcomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceBetweenLocations(route.start, filteredRoute.start);
      const eligible =  distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedEnd === true) {
          // Means that found start is already a part of some vertex
          // We have to take start point vertex id and add it to remove'able ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          let vertex = vertices.find((vertex) => vertex.id === filteredRoute.startPointVertexId);
          extractedIncomingNeighbors.concat(vertex.incomingNeighbors);
          extractedOutcomingNeighbors.concat(vertex.outcomingNeighbors);
          removeableVertexIds.push(filteredRoute.startPointVertexId);
        } else {
          filteredRoute.markedStart = true;
        }
      }
      return eligible;
    });
    const incomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceBetweenLocations(route.start, filteredRoute.end);
      const eligible = distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedEnd === true) {
          // Means that found end is already a part of some vertex
          // We have to take end point vertex id and add it to remove'able ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          let vertex = vertices.find((vertex) => vertex.id === filteredRoute.endPointVertexId);
          extractedIncomingNeighbors.concat(vertex.incomingNeighbors);
          extractedOutcomingNeighbors.concat(vertex.outcomingNeighbors);
          removeableVertexIds.push(filteredRoute.endPointVertexId);
        } else {
          filteredRoute.markedEnd = true;
        }
      }
      return eligible;
    });
    incomingNeighbors.concat(extractedIncomingNeighbors);
    outcomingNeighbors.concat(extractedOutcomingNeighbors);
    const vertex = new Vertex(id, incomingNeighbors, outcomingNeighbors);
    id = id + 1;
    vertices.push(vertex);
    incomingNeighbors.forEach((route) => {
      route.endPointVertexId = vertex.id;
    });
    outcomingNeighbors.forEach((route) => {
      route.startPointVertexId = vertex.id;
    });
    vertices = vertices.filter((vertex) => {
      return removeableVertexIds.includes(vertex.id);
    });
  }); 
};

module.exports = createGraph;