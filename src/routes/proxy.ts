import { readFileSync } from 'fs';
import path from 'path';

import chalk from 'chalk';
import * as cheerio from 'cheerio';
import express, { Request, Response } from 'express';
import request from 'request';

import { definitions } from '../types/supabase';
import { NotFoundHTMLPath } from '../utils/helpers';
import isUUID from '../utils/isUUID';
import { buildProxyTarget, validateProxyTarget } from '../utils/proxy-target';
import { supabase } from '../utils/supabase-client';

const router = express.Router();
process.setMaxListeners(15);
router.use('/', async (req: Request, res: Response) => {
  const [pid, proxyType] = req.subdomains.reverse();
  if (proxyType !== 'p' || !isUUID(pid)) {
    return res.sendFile(NotFoundHTMLPath);
  }

  // eslint-disable-next-line functional/no-let
  let asset_url: string | undefined = req.session?.asset_url;

  if (!asset_url) {
    const { data, error } = await supabase
      .from<definitions['projects']>('projects')
      .select()
      .eq('pid', pid)
      .single();
    if (error) {
      console.error('Supabase Error', error);
      return res.sendFile(NotFoundHTMLPath);
    }

    asset_url = data?.website_url;
    req.session.asset_url = data?.website_url;
  }

  if (asset_url) {
    const url = buildProxyTarget(asset_url, req.originalUrl);
    try {
      await validateProxyTarget(url);
    } catch (error) {
      console.error('Blocked unsafe proxy target', error);
      return res.status(400).send('Invalid proxy target');
    }

    return requestFromUrl(req, url, (proxyRes: unknown) => {
      const typedProxyRes = proxyRes as request.Response;
      const statusCode = typedProxyRes.statusCode;
      const contentType = typedProxyRes.headers['content-type'];

      if (statusCode === 404) {
        // hashHapOf404s[url] = true;
        res.send(404);
      } else if (!contentType || !contentType.includes('html')) {
        setHeaders(typedProxyRes, res);
        typedProxyRes.pipe(res);
      } else {
        setHeaders(typedProxyRes, res);
        res.end(injectJSIntoWebsite((typedProxyRes as any).html));
      }
    });
  }

  return res.sendFile(NotFoundHTMLPath);
});

const requestFromUrl = (
  req: Request,
  url: string,
  callback: (proxyRes: unknown) => any
) => {
  const { body, headers, method } = req;

  const bodyStr =
    body && typeof body === 'object' && Object.keys(body).length > 0
      ? JSON.stringify(body)
      : undefined;

  (headers as Record<string, any>)['accept-encoding'] = 'identity';
  delete (headers as Record<string, any>)['host'];

  const proxy = request({
    body: bodyStr,
    followRedirect: false,
    headers: headers as request.Headers,
    method,
    url,
  });
  proxy.setMaxListeners(Infinity);
  proxy.on('error', (error) => {
    console.error(`${chalk.red('ERROR:')} ${url}`, error);
  });

  proxy.on('response', (proxyResponse: unknown) => {
    const typedProxyResponse = proxyResponse as request.Response;
    const contentType = typedProxyResponse.headers['content-type'];
    if (!contentType || !contentType.includes('html')) {
      callback(typedProxyResponse);
    } else {
      const dataArr: Buffer[] = [];
      typedProxyResponse.on('data', (chunk: Buffer) => dataArr.push(chunk));
      typedProxyResponse.on('end', () => {
        (typedProxyResponse as any).html = Buffer.concat(dataArr).toString();
        callback(typedProxyResponse);
      });
    }
  });
};
console.log(process.env.NODE_ENV);
const buildPath =
  process.env.NODE_ENV === 'development' ? '../../build/main/lib' : '../lib';
const injectJSIntoWebsite = (html: string) => {
  console.log('Injecting JS and CSS');
  const js = readFileSync(
    path.resolve(__dirname, `${buildPath}/main.iife.js`),
    'utf8'
  );
  const css = readFileSync(
    path.resolve(__dirname, `${buildPath}/style.css`),
    'utf8'
  );
  const $ = cheerio.load(html);

  $('body').append(`<script>${js}</script>`);
  $('body').append(`<style>${css}</style>`);
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

const setHeaders = (proxyRes: request.Response, res: Response) => {
  delete proxyRes.headers['content-length'];
  delete proxyRes.headers['content-security-policy'];
  proxyRes.headers['X-Frame-Options'] = '';
  res.writeHead(proxyRes.statusCode, proxyRes.headers);
};

export default router;
