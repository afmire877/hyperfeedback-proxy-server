declare global {
  type Window = {
    hf: {
      pins: Pin[];
      mode: 'browse' | 'comment';
      screen_size: 'desktop' | 'mobile';
    };
  };
}

export type Pin = {
  readonly relativeX: number;
  readonly relativeY: number;
  readonly idSelector: string;
  readonly mouseX: number;
  readonly mouseY: number;
  readonly relativeElement: HTMLElement | Element | string;
  readonly isCompleted?: boolean;
  readonly pathname: string;
  readonly screen_size?: 'desktop' | 'mobile';
};

export type RawPinData = {
  readonly relative_element_selector: string;
  readonly pos_x: number;
  readonly pos_y: number;
  readonly pin_id_selector: string;
  readonly mouse_x: number;
  readonly mouse_y: number;
  readonly is_completed?: boolean;
  readonly pathname?: string;
  readonly screen_size?: 'desktop' | 'mobile';
};

export type ModeChangeData = {
  readonly screenSize?: 'desktop' | 'mobile';
  readonly canvasMode?: 'browse' | 'comment';
};

export type FocusData = {
  readonly idSelector: string;
};

export type ActionEvents =
  | { readonly type: 'uiAction'; readonly action: 'repositionPins' | 'addedComment'; readonly data?: never }
  | { readonly type: 'uiAction'; readonly action: 'modeChange'; readonly data: ModeChangeData }
  | { readonly type: 'uiAction'; readonly action: 'focus'; readonly data: FocusData }
  | { readonly type: 'dataSyncAction'; readonly action: 'syncComments'; readonly data: RawPinData[] | null | undefined };
