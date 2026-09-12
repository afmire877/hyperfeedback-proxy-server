import { promises as dns } from 'dns';
import { isIP } from 'net';

type ResolvedAddress = Readonly<{ address: string; family: number }>;
type Resolver = (hostname: string) => Promise<readonly ResolvedAddress[]>;

const resolveAddresses: Resolver = (hostname) =>
  dns.lookup(hostname, { all: true, verbatim: true });

const isPrivateIPv4 = (address: string) => {
  const [a, b] = address.split('.').map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
};

const isPrivateIPv6 = (address: string) => {
  const normalized = address.toLowerCase();
  const mappedIPv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('ff') ||
    Boolean(mappedIPv4 && isPrivateIPv4(mappedIPv4))
  );
};

export const isPublicAddress = (address: string) => {
  const family = isIP(address);
  if (family === 4) return !isPrivateIPv4(address);
  if (family === 6) return !isPrivateIPv6(address);
  return false;
};

export const validateProxyTarget = async (
  value: string,
  resolver: Resolver = resolveAddresses
) => {
  const target = new URL(value);
  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error('Only HTTP and HTTPS targets are supported');
  }
  if (target.username || target.password) {
    throw new Error('Target URLs cannot contain credentials');
  }

  const hostname = target.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Local targets are not allowed');
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await resolver(hostname);
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new Error('Target must resolve only to public IP addresses');
  }

  return target;
};

export const buildProxyTarget = (baseUrl: string, path: string) =>
  new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
