import { Options } from 'unique-selector';

export const HF_URL = 'http://localhost:3000';
export const pid = location.hostname.split('.')[0];
export const uniqueSelectorOptions: Options = {
  selectorTypes: ['Tag', 'NthChild', 'ID', 'Attributes'],
};

// CSS Classes

export const PIN_CLASSNAME = 'hf-pin';
