export interface Pin {
  relativeX: number;
  relativeY: number;
  idSelector: string;
  mouseX: number;
  mouseY: number;
  relativeElement: HTMLElement | Element | string;
  isCompleted?: boolean;
}
