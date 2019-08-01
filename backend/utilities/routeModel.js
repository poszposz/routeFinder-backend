var Segment = require('./segment');
require('../extensions/array');

class Route {

  constructor(name, category, segmentString) {
    this.markedStart = false;
    this.markedEnd = false;
    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name;
    this.category = category;
    this.segments = this.parseSegments(segmentString);
    this.totalLength = this.segments.reduce((previous, next) => {
      return previous + next.length;
    }, 0);
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
  }

  parseSegments(segmentString) {
    const pointsArray = segmentString.match(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/g).chunk(2);
    const segments = pointsArray.slice(1).map((points, index) => {
      return new Segment(pointsArray[index].concat(points), this.name);
    });
    segments[0].isBeginning = true;
    segments[segments.length - 1].isEnding = true;
    return segments;
  }
}

module.exports = Route;
