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
import { HF_URL, uniqueSelectorOptions } from './constants';
import { Pin } from '../types/lib';
import unique from 'unique-selector';

declare global {
  interface Window {
    hf: {
      pins: Pin[];
    };
  }
}

const handleCreateComment = (event: MouseEvent) => {
  event.preventDefault();

  const el = findTopElement(event);
  if (el.classList?.contains('hf-pin')) return;

  const pin = placePin(el, { clientX: event.clientX, clientY: event.clientY });

  if (pin)
    sendMessageToParent({
      type: 'pinAction',
      data: {
        ...pin,
        relativeElement: unique(
          pin?.relativeElement as Element,
          uniqueSelectorOptions
        ),
      },
    });
};

const handleUIEvents = (event: MessageEvent) => {
  if (event?.data?.type !== 'uiAction') return;

  switch (event.data.action) {
    case 'repositionPins':
      return repositionPins();
    case 'addedComment':
      return getPins();
  }
};

const handleMessage = (event: MessageEvent) => {
  if (event.origin !== HF_URL || !event.data) return;
  handleUIEvents(event);
  if (JSON.parse(event.data)?.currentSession) {
    localStorage.setItem('supabase.auth.token', event.data);
  }
  getPins();
};

const main = async () => {
  disableAllLinks();
  if (!window?.hf?.pins) {
    console.log('window.hf.pins is undefined', window.hf.pins);
    window.hf = { pins: [] };
  }

  // Event Listeners
  window.addEventListener('message', handleMessage);
  window.document.addEventListener('click', handleCreateComment);
  window.addEventListener('resize', repositionPins);
  document.querySelectorAll('.hf-pin').forEach((pin) => {
    pin.addEventListener('click', handleOnClickPin);
    console.log('window.hf', window.hf);
  });
};

(function (root) {
  root.hf = root.hf || { pins: [] };
})(window);

document.addEventListener('DOMContentLoaded', main);
