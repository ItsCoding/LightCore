import * as ReactDOM from 'react-dom';
import { App } from './App';
// import "./index.css";

export const startReact = () => {
    console.log("index.tsx");
    function render() {
        ReactDOM.render(<App />, document.body);
    }
    render();
}