declare global {
  interface Window {
    hf: {
      pins: Pin[];
      mode?: 'browse' | 'comment';
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
}
export interface ActionEvents {
  type: 'uiAction' | 'dataSyncAction';
  action: 'repositionPins' | 'addedComment' | 'syncComments';
  data: any;
}
