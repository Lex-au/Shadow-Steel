// Common interfaces and types for UI components
export interface UIComponent {
  render(): void;
  update?(): void;
  cleanup?(): void;
}

export interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UITheme {
  colors: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    text: string;
    textDim: string;
    accent: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  borderRadius: number;
}

export interface UIEventHandler {
  onClick?: (e: MouseEvent) => void;
  onHover?: (isHovered: boolean) => void;
  onScroll?: (delta: number) => void;
}

export interface UIState {
  isHovered: boolean;
  isActive: boolean;
  isDisabled: boolean;
}