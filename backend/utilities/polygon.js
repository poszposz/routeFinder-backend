class Polygon {

  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  extendedBoundingBox() {
    console.log('created polygon bounding box.');
    const boundingBoxRadiusExtendRatio = 0.01;
    let latitiudeMin = Math.min(this.start.latitude, this.end.latitude);
    let longitudeMin = Math.min(this.start.longitude, this.end.longitude);
    let latitiudeMax = Math.max(this.start.latitude, this.end.latitude);
    let longitudeMax = Math.max(this.start.longitude, this.end.longitude);
    const bottomLeft = { 
      latitude: latitiudeMin - boundingBoxRadiusExtendRatio, 
      longitude: longitudeMin - boundingBoxRadiusExtendRatio
    };
    const topRight = { 
      latitude: latitiudeMax + boundingBoxRadiusExtendRatio, 
      longitude: longitudeMax + boundingBoxRadiusExtendRatio
    };
    return new Polygon(bottomLeft, topRight);;
  }

  locationQuery() {
    let extendedBoundingBox = this.extendedBoundingBox();
    return `${Number(extendedBoundingBox.start.longitude)}, ${Number(extendedBoundingBox.start.latitude)}, ${Number(extendedBoundingBox.end.longitude)}, ${Number(extendedBoundingBox.end.latitude)}`
  }
}

module.exports = Polygon;