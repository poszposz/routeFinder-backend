import React from 'react';
import { 
  Component,
} from 'react';
import { Redirect } from 'react-router-dom'
import axios from 'axios';
import './InputScreen.css';

class InputScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      startLocation: '',
      endLocation: '',
    };
  }

  client = axios.create({
    baseURL: 'http://localhost:3001/',
    timeout: 10000,
    responseType: 'json'
  });

  handleStartLocationChange = (event) => {
    this.setState({ startLocation: event.target.value });
  }

  handleEndLocationChange = (event) => {
    this.setState({ endLocation: event.target.value });
  }

  handleSubmit = () => {
    console.log(`Submitted with start: ${this.state.startLocation}, end: ${this.state.endLocation}`);
    this.setState({ shouldTranstionToMap: true})
  }

  fetchRoute(start, end) {
    fetch(`http://localhost:3001/api/routes/visualizationPoints?startLocation=${start}&endLocation=${end}`).then(response => console.log(response));
  }

  render() {
    if (this.state.shouldTranstionToMap) {
      return <Redirect to={{
        pathname: '/map', 
        state: { startLocation: this.state.startLocation, endLocation: this.state.endLocation}
      }}
      />;
    }
    return (
      <div className="App">
        <header className="App-header">
          <form onSubmit={this.handleSubmit}>
            <label htmlFor="name">Enter start and end locations:</label>
            <br></br>
            <br></br>
            <input
              id="start_location"
              type="text"
              value={this.state.startLocation}
              onChange={this.handleStartLocationChange}
            />
            <input
              id="end_location"
              type="text"
              value={this.state.endLocation}
              onChange={this.handleEndLocationChange}
            />
            <button type="submit" onClick={this.handleSubmit}>
              Submit
            </button>
          </form>
        </header>
      </div>
    );
  }
}

export default InputScreen;
