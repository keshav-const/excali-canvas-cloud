import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Canvas as FabricCanvas, 
  PencilBrush, 
  Rect, 
  Circle, 
  Line, 
  IText,
  Object as FabricObject
} from "fabric";
import { toast } from "sonner";
import { DrawingToolbar, DrawingTool } from "./DrawingToolbar";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("pencil");
  const [activeColor, setActiveColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Drawing state for shapes
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<FabricObject | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 700,
      backgroundColor: "#ffffff",
    });

    // Initialize brushes
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = strokeWidth;

    // Set up event listeners for history management
    canvas.on('path:created', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('object:modified', saveState);

    // Set up mouse events for shape drawing
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    setFabricCanvas(canvas);
    
    // Save initial state
    setTimeout(() => saveState(), 100);
    
    toast("Canvas ready! Start drawing!");

    return () => {
      canvas.dispose();
    };
  }, []);

  // Responsive sizing
  useEffect(() => {
    if (!fabricCanvas) return;

    const resize = () => {
      const wrapper = containerRef.current;
      if (!wrapper) return;
      const width = wrapper.clientWidth;
      const top = wrapper.getBoundingClientRect().top;
      const height = Math.max(400, Math.floor(window.innerHeight - top - 24));
      fabricCanvas.setWidth(width);
      fabricCanvas.setHeight(height);
      fabricCanvas.renderAll();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [fabricCanvas]);

  // Update tool mode
  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset canvas mode
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;

    switch (activeTool) {
      case "pencil":
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = activeColor;
        fabricCanvas.freeDrawingBrush.width = strokeWidth;
        break;
      case "eraser":
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = "#ffffff"; // White color for erasing
        fabricCanvas.freeDrawingBrush.width = strokeWidth * 3; // Thicker for erasing
        break;
      case "select":
        fabricCanvas.selection = true;
        break;
      default:
        // For shapes and text, we handle in mouse events
        fabricCanvas.selection = false;
        break;
    }
  }, [activeTool, activeColor, strokeWidth, fabricCanvas]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    if (!fabricCanvas) return;
    
    const state = JSON.stringify(fabricCanvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [fabricCanvas, historyIndex]);

  // Mouse event handlers for shape drawing
  const handleMouseDown = useCallback((e: any) => {
    if (!fabricCanvas || activeTool === "pencil" || activeTool === "eraser" || activeTool === "select") return;
    
    const pointer = fabricCanvas.getPointer(e.e);
    setIsDrawing(true);
    setStartPoint({ x: pointer.x, y: pointer.y });

    if (activeTool === "text") {
      // Handle text tool
      const text = new IText("Type here...", {
        left: pointer.x,
        top: pointer.y,
        fontSize: 20,
        fill: activeColor,
        fontFamily: 'Arial',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      return;
    }

    // Create shape preview
    let shape: FabricObject | null = null;
    switch (activeTool) {
      case "rectangle":
        shape = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case "circle":
        shape = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case "line":
        shape = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: activeColor,
          strokeWidth: strokeWidth,
        });
        break;
    }

    if (shape) {
      fabricCanvas.add(shape);
      setCurrentShape(shape);
    }
  }, [fabricCanvas, activeTool, activeColor, strokeWidth]);

  const handleMouseMove = useCallback((e: any) => {
    if (!fabricCanvas || !isDrawing || !startPoint || !currentShape) return;
    
    const pointer = fabricCanvas.getPointer(e.e);
    
    switch (activeTool) {
      case "rectangle":
        const rect = currentShape as Rect;
        rect.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
        });
        break;
      case "circle":
        const circle = currentShape as Circle;
        const radius = Math.sqrt(
          Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)
        ) / 2;
        circle.set({
          radius: radius,
          left: startPoint.x - radius,
          top: startPoint.y - radius,
        });
        break;
      case "line":
        const line = currentShape as Line;
        line.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        break;
    }
    
    fabricCanvas.renderAll();
  }, [fabricCanvas, isDrawing, startPoint, currentShape, activeTool]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentShape(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const previousState = history[historyIndex - 1];
    setHistoryIndex(prev => prev - 1);
    
    fabricCanvas.loadFromJSON(previousState, () => {
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    setHistoryIndex(prev => prev + 1);
    
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, history, historyIndex]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    saveState();
    toast("Canvas cleared!");
  };

  const handleExport = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `sketch-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Drawing exported successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      <DrawingToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExport={handleExport}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <div ref={containerRef} className="border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} className="w-full h-auto block touch-none" />
      </div>
    </div>
  );
};