require('../extensions/array');
const uuidv4 = require('./UUIDGenerator');

const longestRouteAllowed = 30;

const maximumSegmentLength = 3;

class Route {

  constructor(id, name, category, segments, isBikeRoute, parent = null, children = null) {
    this.id = id;

    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name === null ? "" : name;
    this.category = category === undefined ? "" : category;
    this.bidirectional = 1; 
    let originalSegments = segments;
    this.totalLength = segments.reduce(((previous, next) => previous + next.length ), 0);
    this.weight = this.totalLength;
    this.segments = this.normalizeSegments(originalSegments);
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
    this.isBikeRoute = isBikeRoute;
    this.parent = parent;
    this.children = children;
    this.assignWeight();
    this.predictBridge();
  }

  assignWeight() {
    this.isLink = false;
    this.isIsolationLink = false;
    if (this.category.includes('ddr')) {
      this.weightMultiplier = 0.7;
    } else if (this.category.includes('kontrapas')) {
      this.weightMultiplier = 0.8;
    } else if (this.category.includes('cpr')) {
      this.weightMultiplier = 0.8;
    } else if (this.category.includes('kontraruch')) {
      this.weightMultiplier = 0.8;
    } else if (this.category.includes('c16t22')) {
      this.weightMultiplier = 0.9;
    } else if (this.category.includes('standard_link')) {
      if (this.totalLength <= 10) {
        this.weightMultiplier = 1.5;
      } else {
        this.weightMultiplier = 2;
      }
      this.isLink = true;
    } else if (this.category.includes('isolation_link')) {
      this.weightMultiplier = 4;
      this.isIsolationLink = true;
    } else {
      if (this.isBikeRoute) {
        this.weightMultiplier = 1;
      } else {
        this.weightMultiplier = 1.2;
      }
    }
    this.weight = (this.totalLength * this.weightMultiplier); 
  }

  predictBridge() {
    // As we have no info about it, we predict whether a route is on differnt level by name guessing.
    // If a route is on another level we won't link it with another ones unless from start or end.
    const bridgeNames = ['most', 'kladka'];
    this.isBridge = false;
    bridgeNames.forEach(name => {
      if (this.name.toLowerCase().includes(name)) {
        this.isBridge = true;
      }
    });
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
    if (this.totalLength < longestRouteAllowed) {
      return new Route(uuidv4(), this.name, this.category, this.segments, this.isBikeRoute, null, [this.copy()]);
    }
    const maximumSegmentsPerRoute = longestRouteAllowed / maximumSegmentLength;
    let mainRoute = new Route(uuidv4(), this.name, this.category, this.segments, this.isBikeRoute, null, null);
    let segments = this.segments.chunk(maximumSegmentsPerRoute);
    let childRoutes = segments.map((segmentChunk) => {
      let route = new Route(uuidv4(), this.name, this.category, segmentChunk, this.isBikeRoute, mainRoute, null);
      return route;
    });
    mainRoute.children = childRoutes;
    return mainRoute;
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

  mergeWith(route) {
    return new Route(this.id, this.name, this.category, this.segments.concat(route.segments), this.isBikeRoute, this.parent, this.children);
  }

  reversed() {
    let reversedSegments = this.segments.concat().map((segment) => segment.reversed()).reverse();
    let route;
    if (this.children === null) {
      route = new Route(this.id, this.name, this.category, reversedSegments, this.isBikeRoute, this.parent, null);
    } else {
      let reversedChildren = this.children.map(route => route.reversed());
      route = new Route(this.id, this.name, this.category, reversedSegments, this.isBikeRoute, this.parent, reversedChildren);
    }
    route.startPointVertexId = this.endPointVertexId;
    route.endPointVertexId = this.startPointVertexId;
    route.weight = this.weight;
    return route;
  }

  copy() {
    let route = new Route(this.id, this.name, this.category, this.segments, this.isBikeRoute, this.parent, this.children);
    route.startPointVertexId = this.startPointVertexId;
    route.endPointVertexId = this.endPointVertexId;
    route.weight = this.weight;
    return route;
  }

  toJSON() {
    return {
      'id': this.id,
      'name': this.name,
      'category': this.category,
      'start': this.start,
      'end': this.end,
      'startPointVertexId': this.startPointVertexId,
      'endPointVertexId': this.endPointVertexId,
      'segments': this.segments,
      'totalLength': this.totalLength,
      'bidirectional': this.bidirectional,
    }
  }

  debugDescription() {
    return {
      'id': this.id,
      'name': this.name,
      'start': this.startPointVertexId,
      'end': this.endPointVertexId,
      'length': this.totalLength,
      'children': this.children,
      'parent': this.parent ? this.parent.id : null,
      'parentChildrenLength': this.parent.children ? this.parent.children.length : null
    }
  }
}

module.exports = Route;
