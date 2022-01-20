import unique from 'unique-selector';
import { ActionEvents } from '../types/lib';
import { initialHFState, uniqueSelectorOptions } from './constants';
import './styles.css';
import {
  calculatePinMatrix,
  getPins,
  handleOnClickPin,
  repositionPins,
  setPins,
} from './ui.controller';
import {
  findTopElement,
  openExternalLinkInNewTab,
  sendMessageToParent,
} from './utils/helpers';
import { init, captureMessage } from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

const handleCreateComment = (event: MouseEvent) => {
  if (window.hf.mode === 'browse') return;
  event.preventDefault();

  const el = findTopElement(event);
  if (el.classList?.contains('hf-pin')) return;

  const pin = calculatePinMatrix(el, {
    clientX: event.clientX,
    clientY: event.clientY,
  });

  if (pin)
    sendMessageToParent({
      type: 'pinAction',
      data: {
        ...pin,
        pathname: window.location.pathname,
        relativeElement: unique(
          pin?.relativeElement as Element,
          uniqueSelectorOptions
        ),
      },
    });
};

const handleDataSyncAction = (event: ActionEvents) => {
  switch (event.action) {
    case 'syncComments':
      return setPins(event.data);
    default:
      return;
  }
};

const changeMode = (mode: Window['hf']['mode']) => {
  window.hf.mode = mode;

  if (typeof mode === 'string' && mode) {
    window.document.body.setAttribute('data-hf-mode', window.hf.mode);
  }

  repositionPins();
};

const handleFocus = (idSelector: string) => {
  const comment = window.hf.pins.find((pin) => pin.idSelector === idSelector);

  if (comment && window.location.pathname !== comment?.pathname) {
    window.location.href =
      window.location.origin + comment?.pathname + '?scroll_to=' + idSelector;
  }
  const pin = document.querySelector(`#${idSelector}`);

  if (!pin) return;
  pin.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
};

export const focusIfNeeded = () => {
  const queryParams = new URLSearchParams(window.location.search);
  if (!queryParams.get('scroll_to')) return;

  const pin = document.querySelector(`#${queryParams.get('scroll_to')}`);

  if (!pin) return;
  pin.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
};

const handleUIAction = (data: ActionEvents) => {
  switch (data.action) {
    case 'repositionPins':
      return repositionPins();
    case 'addedComment':
      return getPins();
    case 'modeChange':
      return changeMode(data.data.newMode);
    case 'focus':
      return handleFocus(data.data.idSelector);
    default:
      return;
  }
};

const handleMessage = (event: MessageEvent) => {
  // @ts-ignore
  if (event.origin !== import.meta.env.VITE_HF_APP_URL || !event.data) return;
  console.log(`Received message PROXY:`, event);

  if (event?.data?.type === 'uiAction') {
    return handleUIAction(event.data);
  } else if (event?.data?.type === 'dataSyncAction') {
    return handleDataSyncAction(event.data);
  }
};

const main = async () => {
  if (!window?.hf?.pins) {
    console.log('window.hf.pins is undefined', window.hf.pins);
    // sometimes for some reason, the pins are not defined on the first load
    window.hf = initialHFState;
  }
  openExternalLinkInNewTab();

  window.document.body.setAttribute('data-hf-mode', window.hf.mode);
  window.document.body.setAttribute('hf-pathname', window.location.pathname);

  // Event Listeners
  window.addEventListener('message', handleMessage);
  window.document.addEventListener('click', handleCreateComment);
  window.addEventListener('resize', repositionPins);

  document.querySelectorAll('.hf-pin').forEach((pin) => {
    pin.addEventListener('click', handleOnClickPin);
  });
};

(function (window) {
  // for some reason, the pins are not defined on the first load
  window.hf = initialHFState;
  window.document.addEventListener('DOMContentLoaded', main);

  init({
    dsn: 'https://37b633aac3c24294baadbe2c46419721@o1070880.ingest.sentry.io/6091543',
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  captureMessage('Hello, world!');
})(window);
