var LocationCoordinate = require('./locationCoordinate');

class Polygon {

  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  extendedBoundingBox() {
    const boundingBoxRadiusExtendRatio = 0.005;
    this.latitiudeMin = Math.min(this.start.latitude, this.end.latitude);
    this.longitudeMin = Math.min(this.start.longitude, this.end.longitude);
    this.latitiudeMax = Math.max(this.start.latitude, this.end.latitude);
    this.longitudeMax = Math.max(this.start.longitude, this.end.longitude);
    const bottomLeft = new LocationCoordinate(this.latitiudeMin - boundingBoxRadiusExtendRatio, this.longitudeMin - boundingBoxRadiusExtendRatio);
    const topRight = new LocationCoordinate(this.latitiudeMax + boundingBoxRadiusExtendRatio, this.longitudeMax + boundingBoxRadiusExtendRatio);
    return new Polygon(bottomLeft, topRight);
  }

  locationQuery() {
    let extendedBoundingBox = this.extendedBoundingBox();
    return `${Number(extendedBoundingBox.start.longitude)}, ${Number(extendedBoundingBox.start.latitude)}, ${Number(extendedBoundingBox.end.longitude)}, ${Number(extendedBoundingBox.end.latitude)}`
  }

  intersectsPolygon(polygon) {
    if (this.latitiudeMax < polygon.latitiudeMin) { return false; }
    if (this.longitudeMax < polygon.longitudeMin) { return false; }
    return true;
  }
}

module.exports = Polygon;
