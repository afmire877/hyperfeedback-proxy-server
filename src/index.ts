export * from './lib/async';
export * from './lib/number';
import http from 'http';

import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';

import proxyRoute from './routes/proxy';
const PORT = process.env.PORT || 5000;

dotenv.config();

// Express set up
const app = express();
app.set('port', PORT);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', proxyRoute);

const server = http.createServer(app);
server.listen(PORT);
server.on('listening', () => {
  console.log('Listening on port', PORT);
});
