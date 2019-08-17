import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './serviceWorker';
import './index.css'
import InputScreen from './Screens/InputScreen/InputScreen';
import MapScreen from './Screens/MapScreen/MapScreen';

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={InputScreen} />
      <Route path="/map" component={MapScreen} />
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'))

serviceWorker.unregister();