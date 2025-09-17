# Canvas Features Documentation

## Overview
The ExcaliSketch Canvas has been completely rewritten using Konva.js to provide a professional whiteboard experience with full functionality including shapes, text, selection, transformation, and robust undo/redo capabilities.

## Architecture
- **Two-layer approach**: Raster layer for freehand drawing/erasing + Vector layer for shapes/text
- **Konva.js + React-Konva**: For high-performance canvas rendering and object manipulation
- **Component-based design**: Modular toolbar and canvas components for maintainability

## Features Implemented

### Drawing Tools
- **Pencil (P)**: Freehand drawing with customizable color and stroke width
- **Eraser (E)**: Pixel-based eraser that removes portions of raster drawings
- Both tools support mouse and touch input for cross-device compatibility

### Shape Tools
- **Rectangle (R)**: Click and drag to create rectangles
- **Ellipse (O)**: Click and drag to create ellipses/circles
- **Line (L)**: Click and drag to create straight lines
- **Text (T)**: Click to place text, double-click to edit existing text

### Selection & Transformation
- **Select Tool (V)**: Select and manipulate objects
- **Multi-select**: Shift+click to add/remove objects from selection
- **Transform handles**: Resize, rotate, and move selected objects
- **Group transforms**: Scale and rotate multiple selected objects together

### History System
- **Undo (Ctrl/Cmd+Z)**: Reverse last action (up to 50 steps)
- **Redo (Ctrl/Cmd+Y)**: Restore undone action
- Supports both raster (drawing/erasing) and vector (objects) operations

### Canvas Actions
- **Export**: Download current canvas as high-quality PNG
- **Clear**: Clear entire canvas with confirmation dialog
- **Delete**: Remove selected objects (Delete/Backspace key)

### Keyboard Shortcuts
- `P` - Pencil tool
- `E` - Eraser tool  
- `R` - Rectangle tool
- `O` - Ellipse tool
- `L` - Line tool
- `T` - Text tool
- `V` - Select tool
- `Ctrl/Cmd+Z` - Undo
- `Ctrl/Cmd+Y` - Redo
- `Delete/Backspace` - Delete selected objects  
- `Arrow keys` - Nudge selected objects (1px, Shift+Arrow for 10px)
- `Escape` - Clear selection

## UI/UX Design
- **Premium dark theme**: Dark background with blue accent colors
- **Vertical toolbar**: Left-side docked toolbar with grouped tools
- **Visual feedback**: Active tool highlighting with glow effects
- **Tooltips**: Hover tooltips showing tool names and shortcuts
- **Responsive**: Adapts to different screen sizes

## Technical Implementation

### Component Structure
```
DrawingCanvas.tsx - Main canvas component with Konva Stage
├── Raster Layer - For pencil/eraser drawing (HTMLCanvas → Konva.Image)
└── Objects Layer - For shapes/text (Konva objects)

DrawingToolbar.tsx - Vertical toolbar with grouped tools
├── Drawing Tools - Pencil, Eraser
├── Shape Tools - Rectangle, Ellipse, Line, Text  
├── Selection Tools - Select, Delete
├── History Actions - Undo, Redo
├── Color Picker - Current color + presets + custom picker
├── Stroke Width - Vertical slider
└── Canvas Actions - Export, Clear
```

### Data Flow
1. **Tool Selection**: Updates active tool state
2. **Drawing/Shape Creation**: Adds objects to canvas state
3. **History Management**: Captures state snapshots for undo/redo
4. **Export**: Combines both layers into final PNG output

## Testing Checklist

### Manual QA Steps ✅
- [x] **Drawing**: Pencil tool draws visible lines with correct color/width
- [x] **Erasing**: Eraser removes parts of drawings (pixel-based)
- [x] **Shapes**: Rectangle, ellipse, line creation via click-drag
- [x] **Text**: Text placement and inline editing
- [x] **Selection**: Single and multi-select with Shift+click
- [x] **Transform**: Resize, rotate, move selected objects
- [x] **Delete**: Delete key removes selected objects
- [x] **Undo/Redo**: History system works for all actions
- [x] **Export**: PNG download includes both raster and vector content
- [x] **Keyboard shortcuts**: All shortcuts function correctly
- [x] **Toolbar**: Visual active state and tooltips present
- [x] **Responsive**: Works across different screen sizes

### Performance Tests ✅
- [x] **Smooth drawing**: No lag during freehand drawing
- [x] **Memory management**: Undo history capped at 50 states
- [x] **Large canvases**: Handles typical whiteboard sizes efficiently

## Browser Compatibility
- ✅ Chrome/Chromium browsers
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (touch support)

## Preview URLs
- **Live Preview**: Available at `/canvas` route in Lovable preview
- **Local Development**: Run `npm run dev` and navigate to `/canvas`

## Future Enhancements
- Layer system for advanced drawing organization
- Save/load canvas data to Supabase database
- Real-time collaboration features
- Additional shape tools (arrow, polygon, etc.)
- Advanced text formatting options
- Image import/embedding capabilities

---

*Last updated: January 2025*
*Implementation: Konva.js + React-Konva architecture*
*Status: Production ready*