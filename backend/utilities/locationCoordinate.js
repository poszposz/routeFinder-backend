class LocationCoordinate {

  constructor(latitude, longitude) {
    this.longitude = Number(longitude);
    this.latitude = Number(latitude);
    this.stringIdentifier = String(this.latitude) + ',' + String(this.longitude);
  }

  equals(location) {
    return (this.longitude === location.longitude && this.latitude === location.latitude);
  }
}

module.exports = LocationCoordinate;
