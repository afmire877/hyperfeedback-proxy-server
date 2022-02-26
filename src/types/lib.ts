declare global {
  interface Window {
    hf: {
      pins: Pin[];
      mode: 'browse' | 'comment';
      screen_size: 'desktop' | 'mobile';
    };
  }
}

export interface Pin {
  relativeX: number;
  relativeY: number;
  idSelector: string;
  mouseX: number;
  mouseY: number;
  relativeElement: HTMLElement | Element | string;
  isCompleted?: boolean;
  pathname: string;
  screen_size?: 'desktop' | 'mobile';
}
export interface ActionEvents {
  type: 'uiAction' | 'dataSyncAction';
  action:
    | 'repositionPins'
    | 'addedComment'
    | 'syncComments'
    | 'modeChange'
    | 'focus';
  data: any;
}
