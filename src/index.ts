import http from 'http';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';

import proxyRoute from './routes/proxy';

const PORT = process.env.PORT || 5000;
const whitelist = [
  'https://hyperfeedback.io',
  'http://hyperfeedback.io',
  'https://*.p.hyperfeedback.io',
  'http://*.p.hyperfeedback.io',
  'http://localhost:300',
];
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (origin && whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
// Express set up
const app = express();
app.set('port', PORT);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  session({
    secret: 'clnWVutlVogJR3a0E0JQa8m',
    resave: true,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 3600000 },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', proxyRoute);

const server = http.createServer(app);
server.listen(PORT);
server.on('listening', () => {
  console.log('Listening on port', PORT);
});
