import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { toast } from "sonner";
import { DrawingToolbar } from "./DrawingToolbar";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 700,
      backgroundColor: "#ffffff",
    });

    // Enable drawing mode first
    canvas.isDrawingMode = true;

    // Initialize the pencil brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = strokeWidth;

    setFabricCanvas(canvas);
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

  useEffect(() => {
    if (!fabricCanvas) return;

    // Ensure drawing mode is enabled and brush exists
    if (!fabricCanvas.isDrawingMode) {
      fabricCanvas.isDrawingMode = true;
    }

    if (!fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
    }
    fabricCanvas.freeDrawingBrush.color = activeColor;
    fabricCanvas.freeDrawingBrush.width = strokeWidth;
  }, [activeColor, strokeWidth, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
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
        activeColor={activeColor}
        onColorChange={setActiveColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onClear={handleClear}
        onExport={handleExport}
      />
      <div ref={containerRef} className="border-2 border-border rounded-lg shadow-lg overflow-hidden bg-background">
        <canvas ref={canvasRef} className="w-full h-auto block touch-none" />
      </div>
    </div>
  );
};