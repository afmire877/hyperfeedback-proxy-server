import { supabase } from './utils/supabase-client';
import unique from 'unique-selector';
import { Pin } from '../types/lib';
import { uniqueSelectorOptions, pid } from './constants';
import { body } from './utils/elements';
import {
  generateRandomString,
  isSelectorValid,
  pinHTML,
} from './utils/helpers';

let pins: Pin[] = [];

export interface Position {
  clientX: number;
  clientY: number;
}

export const getPins = async () => {
  const { data } = await supabase
    .from('projects')
    .select('*, comments(*)')
    .eq('pid', pid)
    .single();

  // update types
  pins = data?.comments?.map((p: any) => {
    let relativeElement = p.relative_element_selector;
    if (isSelectorValid(relativeElement)) {
      relativeElement = document?.querySelector(relativeElement);
    }
    return {
      // @ts-ignore
      relativeX: p.pos_x,
      relativeY: p.pos_y,
      idSelector: p.pin_id_selector,
      mouseX: p.mouse_x,
      mouseY: p.mouse_y,
      relativeElement: relativeElement,
    };
  });
  console.log(pins);
  repositionPins();
};

export const repositionPins = () => {
  pins.forEach((pin) => {
    const { relativeElement: el, idSelector, relativeX, relativeY } = pin;

    if (el instanceof HTMLElement) {
      const { left, top } = el.getBoundingClientRect();
      const pointX = relativeX + left + window.scrollX;
      const pointY = relativeY + top + window.scrollY;
      document.querySelector(`#${pin.idSelector}`)?.remove();
      body?.appendChild(pinHTML(pointX, pointY, idSelector));
    }

    return null;
  });
};

export const placePin = (
  el: HTMLElement | SVGElement,
  { clientY, clientX }: Position
): Pin | void => {
  try {
    const randId = generateRandomString();
    const { left, top } = el.getBoundingClientRect();
    const relativeX = clientX - left; //x position within the element.
    const relativeY = clientY - top; //y position within the element.
    const pointX = relativeX + left + window.pageXOffset;
    const pointY = relativeY + top + window.pageYOffset;

    pins.push({
      idSelector: randId,
      relativeElement: el,
      relativeX,
      relativeY,
      mouseX: clientX,
      mouseY: clientY,
    });

    body?.appendChild(pinHTML(pointX, pointY, randId));

    return {
      relativeX: relativeX,
      relativeY: relativeY,
      idSelector: randId,
      mouseX: clientX,
      mouseY: clientY,
      relativeElement: unique(el, uniqueSelectorOptions),
    };
  } catch (err) {
    console.log(err);
    return;
  }
};
