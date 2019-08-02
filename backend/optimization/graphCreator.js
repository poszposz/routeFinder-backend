const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');
const Graph = require('./graph');

const desiredDistanceThreshold = 20;

function createGraph(routes) {
  console.log('Entered created graph');
  let vertices = [];
  let id = 1;
  routes.forEach((route) => {
    console.log('Going through route');    
    let removeableVertexIds = [];
    let extractedIncomingRoutes = [];
    let extractedOutcomingRoutes = [];
    let outcomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.start);
      const eligible =  distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedStart === true) {
          // Means that found start is already a part of some vertex
          // We have to take start point vertex id and add it to removeable ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          let vertex = vertices.find((iteratedVertex) => {
            return iteratedVertex.id === filteredRoute.startPointVertexId
          });
          extractedIncomingRoutes = extractedIncomingRoutes.concat(vertex.incomingRoutes);
          extractedOutcomingRoutes = extractedOutcomingRoutes.concat(vertex.outcomingRoutes);
          removeableVertexIds.push(filteredRoute.startPointVertexId);
        } else {
          filteredRoute.markedStart = true;
        }
      }
      return eligible;
    });
    let incomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.end);
      const eligible = distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedEnd === true) { 
          // Means that found end is already a part of some vertex
          // We have to take end point vertex id and add it to remove'able ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          let vertex = vertices.find(iteratedVertex => iteratedVertex.id === filteredRoute.endPointVertexId);
          extractedIncomingRoutes = extractedIncomingRoutes.concat(vertex.incomingRoutes);
          extractedOutcomingRoutes = extractedOutcomingRoutes.concat(vertex.outcomingRoutes);
          removeableVertexIds.push(filteredRoute.endPointVertexId);
        } else {
          filteredRoute.markedEnd = true;
        }
      }
      return eligible;
    });
    incomingNeighbors = incomingNeighbors.concat(extractedIncomingRoutes);
    outcomingNeighbors = outcomingNeighbors.concat(extractedOutcomingRoutes);
    incomingNeighbors.forEach((route) => {
      route.endPointVertexId = id;
    });
    outcomingNeighbors.forEach((route) => {
      route.startPointVertexId = id;
    });
    const vertex = new Vertex(id, incomingNeighbors, outcomingNeighbors);
    id = id + 1;
    vertices.push(vertex);
    vertices = vertices.filter((vertex) => {
      return !removeableVertexIds.includes(vertex.id);
    });
  });
  return vertices;
};

module.exports = createGraph;