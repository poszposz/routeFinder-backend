var LocationCoordinate = require('./locationCoordinate');
var distanceCalculation = require('../utilities/distanceCalculation')

class Segment {

  constructor(segmentPoints, routeName) {
    this.routeName = routeName;
    this.isBeginning = false;
    this.isEnding = false;
    this.start = new LocationCoordinate(segmentPoints[1], segmentPoints[0]);
    this.end = new LocationCoordinate(segmentPoints[3], segmentPoints[2]);
    this.length = distanceCalculation.segmentLength(this);
  }

  equals(segment) {
    return (this.start === segment.start && this.end === segment.end);
  }
}

module.exports = Segment;
