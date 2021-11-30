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
  disableAllLinks,
  findTopElement,
  sendMessageToParent,
} from './utils/helpers';

const handleCreateComment = (event: MouseEvent) => {
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
      console.log('syncComments', event);
      return setPins(event.data);
    default:
      return;
  }
};

const handleUIAction = (data: ActionEvents) => {
  switch (data.action) {
    case 'repositionPins':
      return repositionPins();
    case 'addedComment':
      return getPins();
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
  disableAllLinks();
  if (!window?.hf?.pins) {
    console.log('window.hf.pins is undefined', window.hf.pins);
    // sometimes for some reason, the pins are not defined on the first load
    window.hf = initialHFState;
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

(function (window) {
  // for some reason, the pins are not defined on the first load
  window.hf = initialHFState;
})(window);

document.addEventListener('DOMContentLoaded', main);
