export const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length).replace(/[0-9]/g, '');
};
const queryCheck = (s: string) =>
  document.createDocumentFragment().querySelector(s);

export const isSelectorValid = (selector: string) => {
  try {
    queryCheck(selector);
  } catch {
    return false;
  }
  return true;
};

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
const stringToHTML = function (str: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body;
};

export const pinHTML = (x: number, y: number, id: string) =>
  stringToHTML(
    `<div id='${id}' class='hf-pin' style=" translate(-50%, -50%) scale(1, 1) scale(1, 1) skew(0deg) rotate(0deg) !important; position: absolute; height: 15px; width:15px; background:red; border-radius: 100%; z-index: 1000; top: ${y}px; left: ${x}px;" data-hf-x='${x}' data-hf-y='${y}' ></div>`
  );

export const disableAllLinks = () => {
  const links = document.querySelectorAll('a');
  for (let i = 0; i <= links.length - 1; i++) {
    links[i].onclick = function () {
      return false;
    };
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
