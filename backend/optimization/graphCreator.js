const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');

const desiredDistanceThreshold = 20;

function createGraph(routes) {
  let vertices = [];
  let id = 1;
  routes.forEach((route) => {
    let removeableVertexIds = [];
    let extractedIncomingRoutes = [];
    let extractedOutcomingRoutes = [];
    let outcomingNeighbors = routes.filter((filteredRoute) => {
      if (filteredRoute.id === route.id) {
        return false;
      }
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.start);
      const eligible =  distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedStart === true) {
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
      if (filteredRoute.id === route.id) {
        return false;
      }
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.end);
      const eligible = distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedEnd === true) { 
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
  routes.forEach((route) => {
    if (route.endPointVertexId === 0) {
      id = id + 1;
      const vertex = new Vertex(id, [route], []);
      vertices.push(vertex);
      route.endPointVertexId = id;
    } 
  });
  return vertices;
};

module.exports = createGraph;