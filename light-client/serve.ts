// make a express server that serves the static folder build

import express from 'express';
import path from 'path';

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
);

app.listen(port, () => {
    console.log(`Client listening at http://localhost:${port}`)
});