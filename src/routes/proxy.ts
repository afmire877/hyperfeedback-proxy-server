/* eslint-disable functional/immutable-data */
import { readFileSync } from 'fs';

import chalk from 'chalk';
import * as cheerio from 'cheerio';
import express, { Response } from 'express';
import request from 'request';

import isUUID from '../lib/isUUID';
import { supabase } from '../lib/supabase-client';
import { definitions } from '../types/supabase';
import path from 'path/posix';

const router = express.Router();
// Allow proxying self-signed SSL certificates
console.log("Disabling Node's rejection of invalid/unauthorised certificates");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

router.use('/', async (req: any, res: Response) => {
  const [proxyType, pid] = req.subdomains;
  if (proxyType !== 'p' && !pid) return;

  // eslint-disable-next-line functional/no-let
  let asset_url: string | undefined = req.session?.asset_url;

  if (!asset_url && isUUID(pid)) {
    const { data, error } = await supabase
      .from<definitions['projects']>('projects')
      .select()
      .eq('pid', pid)
      .single();
    if (error) {
      return console.log('Supabase Error', error);
    }

    asset_url = data?.website_url;
    req.session.asset_url = data?.website_url;
  }

  if (asset_url) {
    const url = req.session?.asset_url ? asset_url + req.path : asset_url;
    requestFromUrl(req, url, (proxyRes: any) => {
      const statusCode = proxyRes.statusCode;
      const contentType = proxyRes.headers['content-type'];

      if (statusCode === 404) {
        // hashHapOf404s[url] = true;
        res.send(404);
      } else if (!contentType || !contentType.includes('html')) {
        setHeaders(proxyRes, res);
        proxyRes.pipe(res);
      } else {
        setHeaders(proxyRes, res);
        res.end(injectJSIntoWebsite(proxyRes.html));
      }
    });
  }
});

const requestFromUrl = (
  req: any,
  url: string,
  callback: (ProxyRes: any) => any
) => {
  const { _body, body, headers, method } = req;

  const bodyStr = _body === true ? JSON.stringify(body) : undefined;

  headers['accept-encoding'] = 'identity'; // Request non-gzipped code, so we can alter the HTML below and inject our own code]
  delete headers['host']; // So the request doesn't seem to come from localhost

  const proxy = request({ body: bodyStr, headers, method, url });

  proxy.on('error', (error) => {
    console.error(`${chalk.red('ERROR:')} ${url}`, error);
  });

  proxy.on('response', (proxyRes: any) => {
    // logResponse(url, proxyRes);

    // non-HTML -> return proxyRes so we can pipe it
    const contentType = proxyRes.headers['content-type'];
    if (!contentType || !contentType.includes('html')) {
      callback(proxyRes);

      // HTML -> get HTML as string
    } else {
      const dataArr: any = [];
      proxyRes.on('data', (chunk: any) => dataArr.push(chunk));
      proxyRes.on('end', () => {
        proxyRes.html = Buffer.concat(dataArr).toString();
        callback(proxyRes);
      });
    }
  });
};

const injectJSIntoWebsite = (html: string) => {
  console.log('Injecting JS and CSS');
  const js = readFileSync(
    path.resolve(__dirname, '../frontend-scripts/canvas.js'),
    'utf8'
  );
  const css = readFileSync(
    path.resolve(__dirname, '../frontend-scripts/canvas.css'),
    'utf8'
  );
  const $ = cheerio.load(html);
  const body = $('body');
  body.append(
    `<script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js' ></script>`
  );

  body.append(`<script>${js}</script>`);
  body.append(`<style>${css}</style>`);
  return $.html();
};

// const logResponse = (url: string, res: any) => {
//   const statusCode = res.statusCode;

//   // prettier-ignore
//   const color =
//     statusCode >= 200 && statusCode < 300 ? 'green' :
//     statusCode > 400 ? 'red' :
//     'yellow';

//   console.log(`${chalk[color](statusCode)} ${url}`);
// };

const setHeaders = (proxyRes: any, res: Response) => {
  delete proxyRes.headers['content-length'];
  res.writeHead(proxyRes.statusCode, proxyRes.headers);
};

export default router;
