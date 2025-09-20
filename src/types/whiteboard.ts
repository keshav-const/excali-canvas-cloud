export interface Point {
    x: number;
    y: number;
}

export type Tool = "select" | "rectangle" | "ellipse" | "line" | "pencil" | "eraser" | "text";

export interface Element {
    id: string;
    type: 'rect' | 'ellipse' | 'line' | 'text';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: number[];
    text?: string;
    fontSize?: number;
    rotation: number;
    strokeColor: string;
    strokeWidth: number;
    fill?: string;
}

export interface ViewTransform {
    scale: number;
    translateX: number;
    translateY: number;
}