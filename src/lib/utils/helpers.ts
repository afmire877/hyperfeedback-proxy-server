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
  const links = document.querySelectorAll('a');
  for (let i = 0; i <= links.length - 1; i++) {
    links[i].onclick = function () {
      return false;
    };
  }
};
export const openExternalLinkInNewTab = () => {
  const links = document.querySelectorAll('a');
  for (let i = 0; i <= links.length - 1; i++) {
    isExternalURL(links[i].href) && (links[i].target = '_blank');
  }
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

  for (let i = 0; i <= els.length - 1; i++) {
    if (els[i] instanceof SVGElement) return els[i] as SVGElement;
    if (els[i] instanceof HTMLElement) return els[i] as HTMLElement;
  }
  throw Error('Element not found');
};

export const sendMessageToParent = (message: object): boolean => {
  try {
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
