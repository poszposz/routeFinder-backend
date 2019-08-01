const distanceCalculation = require('./../utilities/distanceCalculation');
const Vertex = require('./vertex');

const desiredDistanceThreshold = 20;

function createGraph(routes) {
  console.log('Entered created graph');
  let vertices = [];
  let id = 1;
  routes.forEach((route) => {
    console.log('Going through route');
    let removeableVertexIds = [];
    let extractedIncomingNeighbors = [];
    let extractedOutcomingNeighbors = [];
    const outcomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.start);
      const eligible =  distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedStart === true) {
          // Means that found start is already a part of some vertex
          // We have to take start point vertex id and add it to removeable ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          console.log(`Vertices: ${vertices.map((vertex) => vertex.id)}`);
          console.log(`Id of already existing vertex: ${filteredRoute.startPointVertexId}`);
          let vertex = vertices.find((iteratedVertex) => {
            return iteratedVertex.id === filteredRoute.startPointVertexId
          });
          console.log(`Found vertex: ${vertex.outcomingNeighbors}`);
          extractedIncomingNeighbors.concat(vertex.id);
          extractedOutcomingNeighbors.concat(vertex.outcomingNeighbors);
          removeableVertexIds.push(filteredRoute.startPointVertexId);
        } else {
          console.log('Found outcoming neighbor');
          filteredRoute.markedStart = true;
        }
      }
      return eligible;
    });
    const incomingNeighbors = routes.filter((filteredRoute) => {
      const distance = distanceCalculation.distanceBetweenLocations(route.start, filteredRoute.end);
      const eligible = distance < desiredDistanceThreshold;
      if (eligible === true) {
        if (filteredRoute.markedEnd === true) { 
          // Means that found end is already a part of some vertex
          // We have to take end point vertex id and add it to remove'able ids
          // We have to add all incoming and outcoming routes to the newly created vertex.
          let vertex = vertices.find(iteratedVertex => iteratedVertex.id === filteredRoute.endPointVertexId);
          extractedIncomingNeighbors.concat(vertex.incomingNeighbors);
          extractedOutcomingNeighbors.concat(vertex.outcomingNeighbors);
          removeableVertexIds.push(filteredRoute.endPointVertexId);
        } else {
          console.log('Found incoming neighbor');
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
      return !removeableVertexIds.includes(vertex.id);
    });
  }); 
};

module.exports = createGraph;