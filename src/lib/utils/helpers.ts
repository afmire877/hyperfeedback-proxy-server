import { handleOnClickPin } from '../ui.controller';

import { body } from './elements';

export const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length).replace(/[0-9]/g, '');
};

const queryCheck = (s: string) => {
  return document.createDocumentFragment().querySelector(s);
};

export const isSelectorValid = (selector: string) => {
  try {
    queryCheck(selector);
  } catch {
    return false;
  }
  return true;
};

const stringToHTML = function (str: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body;
};

export const renderPin = (x: number, y: number, id: string, number: number) => {
  const pin = stringToHTML(
    `
    <div id='${id}' class='hf-pin' style="top: ${y}px; left: ${x}px; font-family: 'Inter', sans-serif;" data-hf-x='${x}' data-hf-y='${y}' >
      ${number}
    </div>
    `
  );

  body?.appendChild(pin);
  pin.addEventListener('click', handleOnClickPin);
  return;
};

export const disableAllLinks = () => {
  document.querySelectorAll('a').forEach(link => {
    link.onclick = () => false;
  });
};

export const openExternalLinkInNewTab = () => {
  document.querySelectorAll('a').forEach(link => {
    if (isExternalURL(link.href)) {
      link.target = '_blank';
    }
  });
};

export const isExternalURL = (url: string) => {
  try {
    return url && new URL(url).origin !== window.location.origin;
  } catch (e) {
    console.log('Error: ', url, e);
    return false;
  }
};

export const findTopElement = (event: MouseEvent): HTMLElement | SVGElement => {
  const els = window.document.elementsFromPoint(event.clientX, event.clientY);
  const foundElement = els.find(el => el instanceof SVGElement || el instanceof HTMLElement);

  if (foundElement) {
    return foundElement as HTMLElement | SVGElement;
  }
  throw Error('Element not found');
};

export const sendMessageToParent = (message: Record<string, unknown>): boolean => {
  try {
    console.log('sending message to parent', message);
    parent.postMessage(message, '*');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getProxyURL = (pid: string) =>
  process.env.NODE_ENV === 'development'
    ? `http://${pid}.p.subdomain.test:4333`
    : `https://${pid}.p.${process.env.NEXT_PUBLIC_PROXY_BASE_URL}`;
