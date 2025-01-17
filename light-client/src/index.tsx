import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from 'react-dnd-touch-backend'
// import reportWebVitals from './reportWebVitals';

declare global {
  interface Window { touchToggle: Boolean; }
}

window.touchToggle = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
const dndBackend = window.touchToggle ? TouchBackend : HTML5Backend;
console.log("Am i Touch capable? ", window.touchToggle)
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>

    <DndProvider backend={dndBackend}>
      <App />
    </DndProvider>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
