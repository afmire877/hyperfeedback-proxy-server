const body = document.body;
const excludedElements = ['main', 'svg', 'body', 'footer', 'head'];
let currentZIndex;

let width = 0;
let height = 0;

const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length).replace(/[0-9]/g, '');
};

let pinHTML = (x, y, id) =>
  stringToHTML(
    `<div id='${id}' class='hf-pin' style=" translate(-50%, -50%) scale(1, 1) scale(1, 1) skew(0deg) rotate(0deg) !important; position: absolute; height: 15px; width:15px; background:red; border-radius: 100%; z-index: 1000; top: ${y}px; left: ${x}px;" data-hf-x='${x}' data-hf-y='${y}' ></div>`
  );

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
var stringToHTML = function (str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  return doc.body;
};

function addElementOutline(element) {
  if (element.nextElementSibling.id === 'hf-outline') {
    element.nextElementSibling.remove();
    return;
  }
  if (element.id !== 'hf-outline') {
    let outline = document.createElement('div');
    outline.id = 'hf-outline';
    element.dataset.hfid = 'hf-target';
    element.insertAdjacentElement('beforeend', outline);
  }
}
function removeElementOutline(element) {
  if (element.querySelector('#hf-outline') && element.id !== 'hf-outline') {
    let outline = element.querySelector('#hf-outline');
    let target = outline.closest('[data-hfid=hf-target]');
    if (target) target.dataset.hfid = '';
    outline.remove();
  }
}

const repositionPin = (event) => {
  const pins = document.querySelectorAll('.hf-pin');

  pins.forEach((pin) => {
    let newX = Math.floor(
      (parseInt(pin.dataset.hfX) * window.innerWidth) / width
    );
    let newY = Math.floor(
      (parseInt(pin.dataset.hfY) * window.innerHeight) / height
    );
    console.table({
      newWindow: [window.innerWidth, window.innerHeight],
      oldWindow: [width, height],
      newValues: [newX, newY],
      oldValues: [pin.dataset.hfX, pin.dataset.hfY],
    });
    pin.dataset.hfX = newX;
    pin.dataset.hfY = newY;
    pin.style.top = newY + 'px';
    pin.style.left = newX + 'px';
  });
};

const placePin = (event) => {
  const pin = pinHTML(event.x, event.y, generateRandomString());

  body.appendChild(pin);
  console.log(event.element.path);
  if (window.location !== window.parent.location) {
    let data = JSON.stringify({ x: event.x, y: event.y });
    parent.postMessage(data, '*');
  }

  window.addEventListener('resize', repositionPin);
};

document.addEventListener('DOMContentLoaded', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  window.document.addEventListener('click', placePin);
});
