import { Pin, RawPinData } from '../types/lib';

import { pid, SQLnotFoundMessage } from './constants';
import { focusIfNeeded } from './main';
import {
  generateRandomString,
  isSelectorValid,
  renderPin,
  sendMessageToParent,
} from './utils/helpers';
import { supabase } from './utils/supabase-client';

export type Position = {
  readonly clientX: number;
  readonly clientY: number;
};

export const setPins = (data: RawPinData[] | null | undefined) => {
  try {
    removeAllPins();
    window.hf.pins = data?.map((p: RawPinData): Pin => {
      const initialRelativeElement = p.relative_element_selector;
      const relativeElement = isSelectorValid(initialRelativeElement)
        ? document?.querySelector(initialRelativeElement) ?? initialRelativeElement
        : initialRelativeElement;
      return {
        relativeX: p.pos_x,
        relativeY: p.pos_y,
        idSelector: p.pin_id_selector,
        mouseX: p.mouse_x,
        mouseY: p.mouse_y,
        relativeElement: relativeElement,
        isCompleted: p.is_completed,
        pathname: p.pathname ?? window.location.pathname,
        screen_size: p.screen_size ?? 'desktop',
      };
    }) || [];
    console.log('pins', window.hf.pins);
    repositionPins();
  } catch (error) {
    console.log(error);
  }
};

export const getPins = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, comments(*)')
      .eq('pid', pid)
      .order('created_at', { foreignTable: 'comments' })
      .single();

    if (error) {
      if (error.message === SQLnotFoundMessage) location.reload();

      throw new Error(error.message);
    }

    // TODO: update types
    setPins(data);
  } catch (error) {
    console.log('error', error);
  }
};

const removeAllPins = () => {
  window.hf.pins = [];
  const pins = document.querySelectorAll('.hf-pin');
  pins.forEach((pin: HTMLElement | Element) => {
    pin.remove();
  });
};

export const repositionPins = () => {
  const screenSize = window.hf.screen_size;
  window.hf.pins.forEach((pin, index) => {
    const {
      relativeElement: el,
      idSelector,
      relativeX,
      relativeY,
      isCompleted,
    } = pin;
    document.querySelector(`#${pin.idSelector}`)?.remove();
    console.log(pin.screen_size, screenSize);
    if (isCompleted || pin.screen_size !== screenSize) return;

    if (
      el instanceof HTMLElement &&
      pin.pathname === window.location.pathname
    ) {
      const { left, top } = el.getBoundingClientRect();
      const pointX = relativeX + left + window.scrollX;
      const pointY = relativeY + top + window.scrollY;
      renderPin(pointX, pointY, idSelector, index + 1);
    }
    focusIfNeeded();

    return null;
  });
};

export const calculatePinMatrix = (
  el: HTMLElement | SVGElement,
  { clientY, clientX }: Position
): Pin => {
  const randId = generateRandomString();
  const { left, top } = el.getBoundingClientRect();
  const relativeX = clientX - left; //x position within the element.
  const relativeY = clientY - top; //y position within the element.

  return {
    relativeX: relativeX,
    relativeY: relativeY,
    idSelector: randId,
    mouseX: clientX,
    mouseY: clientY,
    relativeElement: el,
    pathname: window.location.pathname,
  };
};
export const handleOnClickPin = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  sendMessageToParent({
    type: 'uiAction',
    action: 'focus',
    data: {
      idSelector: target?.id,
    },
  });
  return;
};
