import React from 'react';
import { 
  Component,
} from 'react';
import { Map, Polyline, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
  
class MapScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      waypointsLoaded: false,
      waypoints: null,
      center: [50.062004, 19.937522],
      zoom: 13
    };
  }

  componentDidMount() {
    const { startLocation, endLocation } = this.props.location.state;
    console.log(`Starting: ${this.props.location.state.startLocation}`);
    console.log(`Ending: ${this.props.location.state.endLocation}`);

    // fetch(`http://104.248.25.229:3001/api/routes/visualizationPoints?startLocation=${startLocation}&endLocation=${endLocation}`)
    fetch(`http://localhost:3001/api/routes/visualizationPointsAStar?startLocation=${startLocation}&endLocation=${endLocation}`)
        .then(response => response.json())
        .then(json => {
          const links = json
          .this.setState({ waypointsLoaded: true, waypoints: json });
        })
        .catch(error => {
          this.setState({ error });
        });;
  }
  
  render() {
    const { startLocation, endLocation } = this.props.location.state;
    const { waypointsLoaded, waypoints, error } = this.state;
    if (error != null) {
      return (
        <div className="App">
          <header className="App-header">
          <label htmlFor="name">Apologies, unable to route between this two locations</label>
          </header>
        </div>
      );
    }
    if (!waypointsLoaded) {
      return (
        <div className="App">
          <header className="App-header">
          <label htmlFor="name">Loading route from {startLocation} to {endLocation}...</label>
          </header>
        </div>
      );
    }
    console.log('Should render the map');
    return (
        <div id="mapid">
          <Map center={this.state.center} zoom={this.state.zoom} style={{width: '100%', height: window.innerHeight}}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={waypoints} color={'blueviolet'}/>
          </Map>
        </div>
    );
  }
}

export default MapScreen;
