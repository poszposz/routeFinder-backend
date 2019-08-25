require('../extensions/array');
const uuidv4 = require('./UUIDGenerator');

const longestRouteAllowed = 200;

const maximumSegmentLength = 10;

class Route {

  constructor(id, name, category, segments, isBikeRoute, parentRouteId = null) {
    this.id = id;

    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name;
    this.category = category === undefined ? "" : category;
    this.bidirectional = 1; 
    // if (this.category.includes('dwr') | this.category.includes('c16t22') | this.category.includes('cpr') | !isBikeRoute) {
    //   this.bidirectional = 1;      
    // } else { 
    //   this.bidirectional = 0;
    // }
    let originalSegments = segments;
    this.totalLength = segments.reduce(((previous, next) => previous + next.length ), 0);
    this.totalWeight = this.totalLength;
    this.segments = this.normalizeSegments(originalSegments);
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
    this.isBikeRoute = isBikeRoute;
    this.parentRouteId = parentRouteId;
    if (this.category.includes('dwr')) {
      this.weightMultiplier = 0.7;
    } else if (this.category.includes('kontrapas') | this.category.includes('cpr') | this.category.includes('kontraruch')) {
      this.weightMultiplier = 0.8;
    } else if (this.category.includes('c16t22')) {
      this.weightMultiplier = 0.9;
    } else if (!isBikeRoute) {
      this.weightMultiplier = 1.1;
    } else {
      this.weightMultiplier = 1;
    }
    this.totalWeight = this.totalLength * this.weightMultiplier;
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
      let route = new Route(uuidv4(), this.name, this.category, segmentChunk, this.isBikeRoute, this.id);
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
    let route = new Route(this.id, this.name, this.category, newSegments, this.isBikeRoute);
    route.startPointVertexId = this.endPointVertexId;
    route.endPointVertexId = this.startPointVertexId;
    return route;
  }

  copy() {
    let route = new Route(this.id, this.name, this.category, this.segments, this.isBikeRoute);
    route.startPointVertexId = this.startPointVertexId;
    route.endPointVertexId = this.endPointVertexId;
    route.totalWeight = this.totalWeight;
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
