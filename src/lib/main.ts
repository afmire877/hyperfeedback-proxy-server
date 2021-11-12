import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'http://localhost:8000';
const PUBLIC_ANON_KEY =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoiYW5vbiJ9.36fUebxgx1mcBo4s19v0SzqmzunP--hm_hep0uLX0ew';

const HF_URL = 'http://localhost:3000';
const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY);

const body = document.querySelector('body');
let pid: string;

const OUTLINE_ID = 'hf-outline';
// @ts-ignore
const PIN_CLASSNAME = 'hf-pin';
// @ts-ignore
let width = 0;
// @ts-ignore
let height = 0;

interface Pin {
  relativeX: number;
  relativeY: number;
  idSelector: string;
  MouseX: number;
  MouseY: number;
  relativeElement: HTMLElement | Element;
}
let pins: Pin[] = [];

// HELPERS
const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length).replace(/[0-9]/g, '');
};

let pinHTML = (x: number, y: number, id: string) =>
  stringToHTML(
    `<div id='${id}' class='hf-pin' style=" translate(-50%, -50%) scale(1, 1) scale(1, 1) skew(0deg) rotate(0deg) !important; position: absolute; height: 15px; width:15px; background:red; border-radius: 100%; z-index: 1000; top: ${y}px; left: ${x}px;" data-hf-x='${x}' data-hf-y='${y}' ></div>`
  );

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
var stringToHTML = function (str: string) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  return doc.body;
};

const disableAllLinks = () => {
  const links = document.querySelectorAll('a');
  for (let i = 0; i <= links.length - 1; i++) {
    links[i].onclick = function () {
      return false;
    };
  }
};

// UI Controllers

const getPins = async () => {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('projects')
    .select('*, comments(*)')
    .eq('pid', pid)
    .single();

  pins = data.comments;
  repositionPins();
};
// @ts-ignore
function addElementOutline(element) {
  if (element.nextElementSibling.id === OUTLINE_ID) {
    element.nextElementSibling.remove();
    return;
  }
  if (element.id !== OUTLINE_ID) {
    let outline = document.createElement('div');
    outline.id = OUTLINE_ID;
    element.dataset.hfid = 'hf-target';
    element.insertAdjacentElement('beforeend', outline);
  }
}
// @ts-ignore
function removeElementOutline(element: HTMLElement) {
  if (element.querySelector(`#${OUTLINE_ID}`) && element.id !== OUTLINE_ID) {
    let outline = element.querySelector(`#${OUTLINE_ID}`);
    if (outline) {
      let target = outline.closest<HTMLElement>('[data-hfid=hf-target]');
      if (target) target.dataset.hfid = '';
      outline.remove();
    }
  }
}

const repositionPins = () => {
  pins.forEach((pin) => {
    const { left, top } = pin.relativeElement.getBoundingClientRect();
    const pointX = pin.relativeX + left + window.pageXOffset;
    const pointY = pin.relativeY + top + window.pageYOffset;
    console.log(pin.idSelector);
    document.querySelector(`#${pin.idSelector}`)?.remove();
    const newPin = pinHTML(pointX, pointY, pin.idSelector);
    body?.appendChild(newPin);
  });
};

const placePin = (event: MouseEvent) => {
  event.preventDefault();
  const randId = generateRandomString();
  const el = findTopElement(event);
  if (!el) throw Error('Element not found');
  const { left, top } = el?.getBoundingClientRect();
  const relativeX = event.clientX - left; //x position within the element.
  const relativeY = event.clientY - top; //y position within the element.
  const pointX = relativeX + left + window.pageXOffset;
  const pointY = relativeY + top + window.pageYOffset;
  console.log(
    'Left? : ' + pointX + ' ; Top? : ' + pointY + '.',
    'WINDOW:',
    window
  );

  pins.push({
    idSelector: randId,
    relativeElement: el,
    relativeX,
    relativeY,
    MouseX: event.clientX,
    MouseY: event.clientY,
  });
  const pin = pinHTML(pointX, pointY, randId);

  body?.appendChild(pin);

  parent.postMessage(
    {
      x: pointX,
      y: pointY,
      idSelector: randId,
      mouseX: event.clientX,
      mouseY: event.clientY,
      // relativeElement: el,
    },
    '*'
  );
};

const findTopElement = (event: MouseEvent): Element | null => {
  const els = window.document.elementsFromPoint(event.clientX, event.clientY);

  for (let i = 0; i <= els.length - 1; i++) {
    if (els[i] instanceof SVGElement) return els[i];
    if (els[i] instanceof HTMLElement) return els[i];
  }
  return null;
};

// INIT FUNC

document.addEventListener('DOMContentLoaded', () => {
  // setup
  disableAllLinks();
  width = window.innerWidth;
  height = window.innerHeight;
  pid = location.hostname.split('.')[0];

  window.addEventListener('message', (event) => {
    if (event.origin === HF_URL) {
      if (!event.data) return;
      console.log(`Received IFRAME:`, event.data, event);
      localStorage.setItem('supabase.auth.token', event.data);
      getPins();
    }
  });

  // Event Listeners
  window.document.addEventListener('click', placePin);
  window.addEventListener('resize', repositionPins);
});
