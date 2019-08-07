var Segment = require('./segment');
require('../extensions/array');

class Route {

  constructor(id, name, category, segmentString) {
    this.id = id;

    this.name = name;
    this.category = category;
    let originalSegments = this.parseSegments(segmentString);
    this.segments = this.normalizeSegments(originalSegments);
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

  normalizeSegments(segments) {
    return segments.map((segment) => {
      if (segment.length <= 20) {
        return segment;
      }
      let segments = segment.split();
      while (segments[0].length > 20) {
        let reduced = segments.map((smallerSegment) => {
          return smallerSegment.split();
        }).flatten();
        segments = reduced;
      };
      return segments;
    }).flatten();
  }
}

module.exports = Route;
