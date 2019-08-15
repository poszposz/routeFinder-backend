class LocationCoordinate {

  constructor(latitude, longitude) {
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.stringIdentifier = String(this.latitude) + ',' + String(this.longitude);
  }

  equals(location) {
    return (this.longitude === location.longitude && this.latitude === location.latitude);
  }
}

module.exports = LocationCoordinate;
