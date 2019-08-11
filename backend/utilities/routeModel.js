require('../extensions/array');

class Route {

  constructor(id, name, category, segments) {
    this.id = id;

    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name;
    this.category = category === undefined ? "" : category;
    // this.bidirectional = this.category === 'cpr' | this.category === 'ddr' | this.category.includes('c16t22');
    // if (category === undefined) {
    //   this.bidirectional = true;
    // }
    this.bidirectional = 1;
    let originalSegments = segments;
    this.segments = this.normalizeSegments(originalSegments);
    this.totalLength = this.segments.reduce((previous, next) => {
      return previous + next.length;
    }, 0);
    this.start = this.segments[0].start;
    this.end = this.segments[this.segments.length - 1].end;
  }

  normalizeSegments(segments) {
    return segments.map((segment) => {
      if (segment.length <= 40) {
        return segment;
      }
      let segments = segment.split();
      while (segments[0].length > 40) {
        let reduced = segments.map((smallerSegment) => {
          return smallerSegment.split();
        }).flatten();
        segments = reduced;
      };
      return segments;
    }).flatten();
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
    let route = new Route(this.id, this.name, this.category, this.segments);
    route.startPointVertexId = this.endPointVertexId;
    route.endPointVertexId = this.startPointVertexId;
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
