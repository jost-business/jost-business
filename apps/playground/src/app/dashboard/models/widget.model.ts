export interface WidgetDefinition {
  id: string;
  label: string;
  icon: string;
  tag: string; // custom element tag name for the web component
  description: string;
  image: string;
  defaultW: number; // default column span (out of 12)
  defaultH: number; // default row span
  minW: number;
  minH: number;
}

export interface WidgetItem extends WidgetDefinition {
  x: number; // 0-based column index
  y: number; // 0-based row index
  w: number;
  h: number;
  visible: boolean;
}

export type SerializedLayout = Array<Pick<WidgetItem, 'id' | 'x' | 'y' | 'w' | 'h' | 'visible'>>;
