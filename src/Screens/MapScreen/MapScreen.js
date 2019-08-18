import React from 'react';
import { 
  Component,
} from 'react';
import './MapScreen.css';

class MapScreen extends Component {

  componentDidMount() {
    const { startLocation, endLocation } = this.props.location.state;
    console.log(`Starting: ${this.props.location.state.startLocation}`);
    console.log(`Ending: ${this.props.location.state.endLocation}`);

    fetch(`http://localhost:3001/api/routes/visualizationPoints?startLocation=${startLocation}&endLocation=${endLocation}`).then(response => console.log(response));
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
        <label htmlFor="name">Map</label>
        </header>
      </div>
    );
  }
}

export default MapScreen;
