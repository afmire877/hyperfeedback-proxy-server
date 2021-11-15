import './styles.css';
import {
  disableAllLinks,
  findTopElement,
  sendMessageToParent,
} from './utils/helpers';
import {
  getPins,
  handleOnClickPin,
  placePin,
  repositionPins,
} from './ui.controller';
import { HF_URL } from './constants';

const handleCreateComment = (event: MouseEvent) => {
  event.preventDefault();

  const el = findTopElement(event);
  if (el.classList?.contains('hf-pin')) return;

  const pin = placePin(el, { clientX: event.clientX, clientY: event.clientY });
  if (pin) sendMessageToParent({ type: 'pinAction', data: pin });
};

const handleUIEvents = (event: MessageEvent) => {
  if (event?.data?.type !== 'uiAction') return;

  switch (event.data.action) {
    case 'repositionPins':
      return repositionPins();
  }
};

const handleMessage = (event: MessageEvent) => {
  if (event.origin !== HF_URL || !event.data) return;
  handleUIEvents(event);
  localStorage.setItem('supabase.auth.token', event.data);
  getPins();
};

const main = async () => {
  disableAllLinks();

  // Event Listeners
  window.addEventListener('message', handleMessage);
  window.document.addEventListener('click', handleCreateComment);
  window.addEventListener('resize', repositionPins);
  document.querySelectorAll('.hf-pin').forEach((pin) => {
    pin.addEventListener('click', handleOnClickPin);
  });
};

document.addEventListener('DOMContentLoaded', main);
