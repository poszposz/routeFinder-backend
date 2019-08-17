import React from 'react';
import { 
  Component,
} from 'react';
import './InputScreen.css';

class InputScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startLocation: '',
      endLocation: '',
      routeDescription: ''
    };
    this.handleStartLocationChange = this.handleStartLocationChange.bind(this);
    this.handleEndLocationChange = this.handleEndLocationChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStartLocationChange(event) {
    this.setState({ startLocation: event.target.value });
  }

  handleEndLocationChange(event) {
    this.setState({ endLocation: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    // fetch(`/api/routes/find?startLocation=${encodeURIComponent(this.state.startLocation)}&endLocation=${encodeURIComponent(this.state.endLocation)}`)
    //   .then(response => response.json())
    //   .then(state => this.setState(state));
  }

  render() {
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
            <button type="submit">Submit</button>
          </form>
          <p>{this.state.routeDescription}</p>
        </header>
      </div>
    );
  }
}

export default InputScreen;
