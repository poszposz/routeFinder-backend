import React from 'react';
import ReactDOM from 'react-dom';
import InputScreen from './InputScreen';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InputScreen />, div);
  ReactDOM.unmountComponentAtNode(div);
});
