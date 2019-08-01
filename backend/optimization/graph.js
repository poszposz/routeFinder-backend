const createGraph = require('./graphCreator');

class Graph {

  constructor(routes) {
    this.vertices = createGraph(routes);
  }
}

module.exports = Graph;