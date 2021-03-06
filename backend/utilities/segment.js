var LocationCoordinate = require('./locationCoordinate');
var distanceCalculation = require('../utilities/distanceCalculation');
var uuidv4 = require('./UUIDGenerator');

class Segment {

  constructor(segmentPoints, routeName) {
    this.routeName = routeName;
    this.id = uuidv4();

    this.isBeginning = false;
    this.isEnding = false;
    this.start = new LocationCoordinate(segmentPoints[1], segmentPoints[0]);
    this.end = new LocationCoordinate(segmentPoints[3], segmentPoints[2]);
    this.length = distanceCalculation.segmentLength(this);
  }

  equals(segment) {
    return (this.start === segment.start && this.end === segment.end);
  }

  reversed() {
    const segment = new Segment([this.end.longitude, this.end.latitude, this.start.longitude, this.start.latitude], this.routeName);
    if (this.isBeginning) {
      segment.isEnding = true;
    } else if (this.isEnding) {
      segment.isBeginning = true;
    }
    return segment;
  }

  split() {
    let averageLocation = new LocationCoordinate((this.start.latitude + this.end.latitude) / 2, (this.start.longitude + this.end.longitude) / 2);
    let startMiddleSegment = new Segment([this.start.longitude, this.start.latitude, averageLocation.longitude, averageLocation.latitude], this.routeName);
    let middleEndSegment = new Segment([averageLocation.longitude, averageLocation.latitude, this.end.longitude, this.end.latitude], this.routeName);
    return [startMiddleSegment, middleEndSegment];
  }
}

module.exports = Segment;
