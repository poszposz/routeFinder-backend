import React from 'react';
import { 
  Component,
} from 'react';
import { Redirect } from 'react-router-dom'
import './InputScreen.css';

class InputScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      startLocation: '',
      endLocation: '',
      routeType: 'BEST'
    };
  }

  handleStartLocationChange = (event) => {
    this.setState({ startLocation: event.target.value });
  }

  handleEndLocationChange = (event) => {
    this.setState({ endLocation: event.target.value });
  }

  handleSubmit = () => {
    this.setState({ shouldTranstionToMap: true})
  }

  handleRouteTypeChange = (event) => {
    this.setState({ routeType: event.target.value });
  }

  render() {
    if (this.state.shouldTranstionToMap) {
      this.props.history.push('/');
      return <Redirect to={{
        pathname: '/map', 
        state: { startLocation: this.state.startLocation, endLocation: this.state.endLocation, routeType: this.state.routeType}
      }}
      />;
    }
    return (
      <div className="App">
        <header className="App-header">
        <label className="label-large">🚴</label>
        <br></br>
        <label className="label">(Using not enitrely tested A* algorithm)</label>
        <br></br>
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
            <div onChange={this.handleRouteTypeChange}>
              <input type="radio" className="radio" value="BEST" defaultChecked name="gender"/> <label className="label-small">Best</label>
              <input type="radio" className="radio" value="SHORTEST" name="gender"/> <label className="label-small">Shortest</label>
            </div>
            <button 
              className="button"
              type="submit" 
              onClick={this.handleSubmit}
            >
              Submit
            </button>
          </form>
          <br></br>
            <label className="label-small">Version 1.1.1</label>
        </header>
      </div>
    );
  }
}

export default InputScreen;
