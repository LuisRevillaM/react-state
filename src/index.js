import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


export const fetchColor = ({ hex, dispatch, abortSignal }) => async function fetchFlow() {
  console.log('getting')
  dispatch({ type: "fetch" });

  const data = await fetch(`http://www.thecolorapi.com/id?hex=${hex}`, {
    signal: abortSignal,
  });

  const jsonData = await data.json();

  dispatch({ type: "success", payload: jsonData });
};


ReactDOM.render(<App fetchColor={fetchColor} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
