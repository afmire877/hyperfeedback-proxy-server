import './styles.css';
import {
  disableAllLinks,
  findTopElement,
  sendMessageToParent,
} from './utils/helpers';
import { getPins, placePin, repositionPins } from './ui.controller';
import { HF_URL } from './constants';

// let width = 0;
// let height = 0;

const handleCreateComment = (event: MouseEvent) => {
  event.preventDefault();
  const el = findTopElement(event);

  const pin = placePin(el, { clientX: event.clientX, clientY: event.clientY });
  if (pin) sendMessageToParent(pin);
};

const handleMessage = (event: MessageEvent) => {
  if (event.origin !== HF_URL || !event.data) return;
  localStorage.setItem('supabase.auth.token', event.data);
  getPins();
};

const main = async () => {
  disableAllLinks();
  // width = window.innerWidth;
  // height = window.innerHeight;

  // Event Listeners
  window.addEventListener('message', handleMessage);
  window.document.addEventListener('click', handleCreateComment);
  window.addEventListener('resize', repositionPins);
};

document.addEventListener('DOMContentLoaded', main);
