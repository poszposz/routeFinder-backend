var LocationCoordinate = require('./locationCoordinate');

class Polygon {

  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  extendedBoundingBox() {
    const boundingBoxRadiusExtendRatio = 0.01;
    let latitiudeMin = Math.min(this.start.latitude, this.end.latitude);
    let longitudeMin = Math.min(this.start.longitude, this.end.longitude);
    let latitiudeMax = Math.max(this.start.latitude, this.end.latitude);
    let longitudeMax = Math.max(this.start.longitude, this.end.longitude);
    const bottomLeft = new LocationCoordinate(latitiudeMin - boundingBoxRadiusExtendRatio, longitudeMin - boundingBoxRadiusExtendRatio);
    const topRight = new LocationCoordinate(latitiudeMax + boundingBoxRadiusExtendRatio, longitudeMax + boundingBoxRadiusExtendRatio);
    return new Polygon(bottomLeft, topRight);;
  }

  locationQuery() {
    let extendedBoundingBox = this.extendedBoundingBox();
    return `${Number(extendedBoundingBox.start.longitude)}, ${Number(extendedBoundingBox.start.latitude)}, ${Number(extendedBoundingBox.end.longitude)}, ${Number(extendedBoundingBox.end.latitude)}`
  }
}

module.exports = Polygon;