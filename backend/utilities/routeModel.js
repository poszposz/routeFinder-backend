require('../extensions/array');

class Route {

  constructor(id, name, category, segments) {
    this.id = id;

    this.startPointVertexId = 0;
    this.endPointVertexId = 0;

    this.name = name;
    this.category = category;
    this.bidirectional = this.category === 'cpr' | this.category === 'ddr' | this.category.includes('c16t22');
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

  splitBy(segment) {
    let segmentFound = false;
    let prefixingSegments = [];
    let suffixingSegments = [];
    this.segments.forEach((iteratedSegment) => {
      if (iteratedSegment.id === segment.id) {
        segmentFound = true;
      }
      if (segmentFound) {
        prefixingSegments.push(segment);
      } else {
        suffixingSegments.push(segment);
      }
    });
    return [prefixingSegments, suffixingSegments];
  }
}

module.exports = Route;
