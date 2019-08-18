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

  render() {
    if (this.state.shouldTranstionToMap) {
      this.props.history.push('/');
      return <Redirect to={{
        pathname: '/map', 
        state: { startLocation: this.state.startLocation, endLocation: this.state.endLocation}
      }}
      />;
    }
    return (
      <div className="App">
        <header className="App-header">
        <label className="label-large">🚴</label>
        <br></br>
        <label className="label">Welcome to bike route finder for Kraków</label>
        <br></br>
        <label className="label">Enter start and end street names:</label>
          <form onSubmit={this.handleSubmit}>
            <br></br>
            <br></br>
            <input
              className="input"
              id="start_location"
              type="text"
              value={this.state.startLocation}
              onChange={this.handleStartLocationChange}
              placeholder={"Start"}
            />
            <p></p>
            <input
              className="input"
              id="end_location"
              type="text"
              value={this.state.endLocation}
              onChange={this.handleEndLocationChange}
              placeholder={"End"}
            />
            <p></p>
            <button 
              className="button"
              type="submit" 
              onClick={this.handleSubmit}
            >
              Submit
            </button>
          </form>
        </header>
      </div>
    );
  }
}

export default InputScreen;
