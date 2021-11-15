import { supabase } from './utils/supabase-client';
import unique from 'unique-selector';
import { Pin } from '../types/lib';
import { uniqueSelectorOptions, pid } from './constants';
import {
  generateRandomString,
  isSelectorValid,
  renderPin,
  sendMessageToParent,
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
      isCompleted: p.is_completed,
    };
  });
  repositionPins();
};

export const repositionPins = () => {
  pins.forEach((pin, index) => {
    const {
      relativeElement: el,
      idSelector,
      relativeX,
      relativeY,
      isCompleted,
    } = pin;
    document.querySelector(`#${pin.idSelector}`)?.remove();
    if (isCompleted) return;

    if (el instanceof HTMLElement) {
      const { left, top } = el.getBoundingClientRect();
      const pointX = relativeX + left + window.scrollX;
      const pointY = relativeY + top + window.scrollY;
      renderPin(pointX, pointY, idSelector, index + 1);
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

    pins.push({
      idSelector: randId,
      relativeElement: el,
      relativeX,
      relativeY,
      mouseX: clientX,
      mouseY: clientY,
    });

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
export const handleOnClickPin = (e: Event) => {
  const target = e.target;

  sendMessageToParent({
    type: 'uiAction',
    action: 'focus',
    data: {
      // @ts-ignore
      idSelector: target?.id,
    },
  });
  return;
};
