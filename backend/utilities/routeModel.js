require('../extensions/array');
const uuidv4 = require('./UUIDGenerator');

const longestRouteAllowed = 300;

const maximumSegmentLength = 20;

class Route {

  constructor(id, name, category, segments, shouldNormalizeSegments = true) {
    this.id = id;

    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name;
    this.category = category === undefined ? "" : category;
    this.bidirectional = 1;
    let originalSegments = segments;
    this.totalLength = segments.reduce((previous, next) => {
      return previous + next.length;
    }, 0);
    if (shouldNormalizeSegments) {
      this.segments = this.normalizeSegments(originalSegments);
    } else {
      this.segments = originalSegments;
    }
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
  }

  normalizeSegments(segments) {
    return segments.map((segment) => {
      if (segment.length <= maximumSegmentLength) {
        return segment;
      }
      let segments = segment.split();
      while (segments[0].length > maximumSegmentLength) {
        let reduced = segments.map((smallerSegment) => {
          return smallerSegment.split();
        }).flatten();
        segments = reduced;
      };
      return segments;
    }).flatten();
  }

  adjustEndings() {
    if (this.segments.length === 0) { return; }
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
  }

  split() {
    if (this.totalLength < longestRouteAllowed) { return this; }
    const maximumSegmentsPerRoute = longestRouteAllowed / maximumSegmentLength;
    let segments = this.segments.chunk(maximumSegmentsPerRoute);
    return segments.map((segmentChunk) => {
      let route = new Route(uuidv4(), this.name, this.category, segmentChunk);
      return route;
    });
  }

  splitBy(segment) {
    let segmentFound = false;
    let prefixingSegments = [];
    let suffixingSegments = [];
    this.segments.forEach((iteratedSegment) => {
      if (iteratedSegment.id === segment.id) {
        segmentFound = true;
      }
      if (segmentFound) {
        prefixingSegments.push(iteratedSegment);
      } else {
        suffixingSegments.push(iteratedSegment);
      }
    });
    return [prefixingSegments, suffixingSegments];
  }

  reversed() {
    let newSegments = this.segments.map((segment) => segment.reversed()).concat().reverse();
    let route = new Route(this.id, this.name, this.category, newSegments);
    route.startPointVertexId = this.endPointVertexId;
    route.endPointVertexId = this.startPointVertexId;
    return route;
  }

  copy() {
    let route = new Route(this.id, this.name, this.category, this.segments);
    route.startPointVertexId = this.startPointVertexId;
    route.endPointVertexId = this.endPointVertexId;
    return route;
  }

  debugDescription() {
    return {
      'id': this.id,
      'name': this.name,
      'start': this.startPointVertexId,
      'end': this.endPointVertexId,
      'length': this.totalLength,
    }
  }
}

module.exports = Route;
