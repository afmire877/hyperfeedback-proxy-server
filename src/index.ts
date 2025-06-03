import http from 'http';

import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import session from 'express-session';
dotenv.config();

import proxyRoute from './routes/proxy';

const PORT = process.env.PORT || 5000;
// const allowedRoutes = ['https://hyperfeedback.io', 'http://localhost:3000', 'http://a4b2-79-69-253-85.ngrok.io'];
const corsOptions = {
  origin: '*',
};
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

Sentry.init({
  dsn: 'https://5f3308363e944667aa718f5283e45c80@o1070880.ingest.sentry.io/6067284',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use('/', cors(corsOptions), proxyRoute);

app.use(Sentry.Handlers.errorHandler());
const errorHandler: ErrorRequestHandler = (_, __, res) => {
  res.statusCode = 500;
  res.end((res.sentry || '') + '\n');
};
app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT);
server.on('listening', () => {
  console.log('Listening on port', PORT);
});
