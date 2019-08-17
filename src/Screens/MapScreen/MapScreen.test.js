import React from 'react';
import ReactDOM from 'react-dom';
import MapScreen from './MapScreen';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MapScreen />, div);
  ReactDOM.unmountComponentAtNode(div);
});
