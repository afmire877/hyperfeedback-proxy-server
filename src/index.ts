import http from 'http';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';

import proxyRoute from './routes/proxy';


const PORT = process.env.PORT || 5000;
// const allowedRoutes = ['https://hyperfeedback.io', 'http://localhost:3000', 'http://a4b2-79-69-253-85.ngrok.io'];
const corsOptions = {
  origin:  '*'
}
// Express set up
const app = express();
app.set('port', PORT);
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: 'clnWVutlVogJR3a0E0JQa8m',
    resave: true,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 3600000 },
  })
);
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', cors(corsOptions),  proxyRoute);

const server = http.createServer(app);
server.listen(PORT);
server.on('listening', () => {
  console.log('Listening on port', PORT);
});
