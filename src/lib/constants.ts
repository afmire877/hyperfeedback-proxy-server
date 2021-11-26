import { Options } from 'unique-selector';

export const HF_URL = process.env.HF_APP_URL || 'https://localhost:3000';
export const pid = location.hostname.split('.')[0];
export const uniqueSelectorOptions: Options = {
  selectorTypes: ['Tag', 'NthChild', 'ID', 'Attributes'],
};
export const SQLnotFoundMessage =
  'JSON object requested, multiple (or no) rows returned';
// CSS Classes

export const PIN_CLASSNAME = 'hf-pin';
