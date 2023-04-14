import * as ReactDOM from 'react-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { App } from './App';
import "./index.css";
import { Chart , BarElement, CategoryScale, LinearScale, LineElement, PointElement } from "chart.js";
import 'chartjs-adapter-luxon';
import { StreamingPlugin, RealTimeScale } from 'chartjs-plugin-streaming';
Chart.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    StreamingPlugin,
    RealTimeScale,
    BarElement
);
function render() {
  ReactDOM.render(<App />, document.body);
}

render();