import test from 'ava';

import {
  buildProxyTarget,
  isPublicAddress,
  validateProxyTarget,
} from './proxy-target';

const publicResolver = async () => [{ address: '93.184.216.34', family: 4 }];

test('accepts an HTTP target that resolves to a public address', async (t) => {
  const target = await validateProxyTarget(
    'https://example.com',
    publicResolver
  );
  t.is(target.hostname, 'example.com');
});

test('rejects unsupported protocols and URL credentials', async (t) => {
  await t.throwsAsync(() =>
    validateProxyTarget('file:///etc/passwd', publicResolver)
  );
  await t.throwsAsync(() =>
    validateProxyTarget('https://user:password@example.com', publicResolver)
  );
});

test('rejects localhost, private literals, and private DNS results', async (t) => {
  await t.throwsAsync(() =>
    validateProxyTarget('http://localhost', publicResolver)
  );
  await t.throwsAsync(() =>
    validateProxyTarget('http://127.0.0.1', publicResolver)
  );
  await t.throwsAsync(() =>
    validateProxyTarget('https://example.com', async () => [
      { address: '10.0.0.4', family: 4 },
    ])
  );
});

test('classifies common private and public address ranges', (t) => {
  t.false(isPublicAddress('169.254.169.254'));
  t.false(isPublicAddress('192.168.1.20'));
  t.false(isPublicAddress('::1'));
  t.false(isPublicAddress('fd00::1'));
  t.true(isPublicAddress('93.184.216.34'));
  t.true(isPublicAddress('2606:4700:4700::1111'));
});

test('builds a target without allowing a leading slash to discard the base path', (t) => {
  t.is(
    buildProxyTarget('https://example.com/review', '/assets/app.js?version=1'),
    'https://example.com/review/assets/app.js?version=1'
  );
});
