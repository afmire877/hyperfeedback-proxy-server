import chalk from 'chalk';
import express, { Request, Response } from 'express';
import request from 'request';
import { supabase } from '../lib/supabase-client';
import { definitions } from '../types/supabase';
const router = express.Router();

// Allow proxying self-signed SSL certificates
console.log("Disabling Node's rejection of invalid/unauthorised certificates");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

// const hashHapOf404s: { [key: string]: Boolean } = {};

router.use('/p/:pid', async (req, res) => {
  const { pid } = req.params;
  // Ask WEBSITE1
  if (!pid) return;
  console.log(pid);
  let { data, error } = await supabase
    .from<definitions['projects']>('projects')
    .select()
    .eq('pid', pid)
    .single();
  if (error) {
    return console.log('Supabase Error', error);
  }
  if (data?.asset_url) {
    requestFromUrl(req, data?.asset_url, (proxyRes1: any) => {
      const statusCode = proxyRes1.statusCode;
      const contentType = proxyRes1.headers['content-type'];

      if (statusCode === 404) {
        // hashHapOf404s[url] = true;
        res.send(404);
      } else if (!contentType || !contentType.includes('html')) {
        setHeaders(proxyRes1, res);
        proxyRes1.pipe(res);
      } else {
        res.end(proxyRes1.html);
      }
    });
  }
});

const requestFromUrl = (req: Request, url: string, callback: Function) => {
  const { body, headers, method } = req;

  const bodyStr = JSON.stringify(body);

  headers['accept-encoding'] = 'identity'; // Request non-gzipped code, so we can alter the HTML below and inject our own code]
  delete headers['host']; // So the request doesn't seem to come from localhost

  const proxy = request({ body: bodyStr, headers, method, url });

  proxy.on('error', (error) => {
    console.error(`${chalk.red('ERROR:')} ${url}`, error);
  });

  proxy.on('response', (proxyRes: any) => {
    logResponse(url, proxyRes);

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
        proxyRes.html = getAllRelativeAssets(proxyRes.html, url);
        callback(proxyRes);
      });
    }
  });
};

const getAllRelativeAssets = (html: string, url: string) => {
  let regex = new RegExp(/((href="\/|src="\/))/gim);
  if (url[url.length - 1] !== '/') url += '/';
  console.log(url);
  return html.replace(regex, `href="${url}`);
};

// const injectWebsite2Into1 = (html1, html2) => {
//   const html2Modified = html2
//     .replace('<!DOCTYPE html>', '')
//     .replace(/<html[\w\W]*?>/gi, '')
//     .replace(/<head[\w\W]*?>/gi, '')
//     .replace(/<meta[\w\W]*?>/gi, '')
//     .replace('</head>', '')
//     .replace('<body', '<div class="WEBSITE2"')
//     .replace('</body>', '</div>')
//     .replace('</html>', '');

//   const html2in1 = html1
//     .replace(new RegExp(WEBSITE1, 'gi'), '') // Ensure all absolute links to relative so links don't navigate to the actual website
//     .replace(
//       '</body>',
//       `
//         <style>
//           .WEBSITE2 {
//             position: fixed;
//             top: 0;
//             width: 100vw;
//             z-index: 999999;
//             pointer-events: none;             /* Allow click through to WEBSITE1 */
//             text-shadow: 1px 1px 1px black;
//           }

//           .WEBSITE2 * {
//             background: none !important;      /* Make sure we can see WEBSITE1 */
//           }

//           .WEBSITE2 a {
//             pointer-events: initial;          /* Links should still be clickable */
//           }
//         </style>

//         ${html2Modified}
//       </body>
//     `
//     );

//   return html2in1;
// };

const logResponse = (url: string, res: any) => {
  const statusCode = res.statusCode;

  // prettier-ignore
  const color =
    statusCode >= 200 && statusCode < 300 ? 'green' :
    statusCode > 400 ? 'red' :
    'yellow';

  console.log(`${chalk[color](statusCode)} ${url}`);
};

const setHeaders = (proxyRes: any, res: Response) => {
  delete proxyRes.headers['content-length'];
  res.writeHead(proxyRes.statusCode, proxyRes.headers);
};

export default router;
