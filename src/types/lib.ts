declare global {
  interface Window {
    hf: {
      pins: Pin[];
      mode: 'browse' | 'comment';
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
}
export interface ActionEvents {
  type: 'uiAction' | 'dataSyncAction';
  action: 'repositionPins' | 'addedComment' | 'syncComments' | 'modeChange';
  data: any;
}
