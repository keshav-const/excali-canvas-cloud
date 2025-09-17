import { useEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Line, Rect, Ellipse, Text, Transformer, Image } from "react-konva";
import Konva from "konva";
import { toast } from "sonner";
import { DrawingToolbar, DrawingTool } from "./DrawingToolbar";

// Types for canvas objects
interface CanvasObject {
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

interface HistoryState {
  objects: CanvasObject[];
  rasterData: string | null;
}

export const DrawingCanvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const rasterLayerRef = useRef<Konva.Layer>(null);
  const objectsLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const rasterCanvasRef = useRef<HTMLCanvasElement>(null);
  const rasterImageRef = useRef<Konva.Image>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tool and drawing state
  const [activeTool, setActiveTool] = useState<DrawingTool>("pencil");
  const [activeColor, setActiveColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [rasterImageData, setRasterImageData] = useState<Konva.Image | null>(null);
  
  // Undo/Redo system
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });

  // Initialize raster canvas for brush/eraser
  useEffect(() => {
    const rasterCanvas = document.createElement('canvas');
    rasterCanvas.width = canvasSize.width;
    rasterCanvas.height = canvasSize.height;
    rasterCanvasRef.current = rasterCanvas;
    
    // Create initial Konva Image for raster layer
    const ctx = rasterCanvas.getContext('2d')!;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    updateRasterImage();
    saveState();
    
    toast("Canvas ready! Start drawing!");
  }, []);

  const updateRasterImage = useCallback(() => {
    if (!rasterCanvasRef.current || !rasterLayerRef.current) return;
    
    const rasterCanvas = rasterCanvasRef.current;
    const imageObj = new window.Image();
    imageObj.onload = () => {
      if (rasterImageRef.current) {
        rasterImageRef.current.image(imageObj);
        rasterLayerRef.current?.batchDraw();
      }
    };
    imageObj.src = rasterCanvas.toDataURL();
  }, []);

  // Responsive sizing
  useEffect(() => {
    const resize = () => {
      const wrapper = containerRef.current;
      if (!wrapper) return;
      const width = Math.min(wrapper.clientWidth, 1400);
      const top = wrapper.getBoundingClientRect().top;
      const height = Math.max(400, Math.floor(window.innerHeight - top - 100));
      setCanvasSize({ width, height });
      
      // Update raster canvas size
      if (rasterCanvasRef.current) {
        rasterCanvasRef.current.width = width;
        rasterCanvasRef.current.height = height;
        updateRasterImage();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [updateRasterImage]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelectedObjects();
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }
      
      // Arrow key nudging
      if (selectedIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const nudgeDistance = e.shiftKey ? 10 : 1;
        nudgeSelectedObjects(e.key, nudgeDistance);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, historyIndex]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    const state: HistoryState = {
      objects: [...canvasObjects],
      rasterData: rasterCanvasRef.current?.toDataURL() || null
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [canvasObjects, historyIndex]);

  // Utility functions
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const deleteSelectedObjects = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setCanvasObjects(prev => prev.filter(obj => !selectedIds.includes(obj.id)));
    setSelectedIds([]);
    setTimeout(saveState, 10);
  }, [selectedIds, saveState]);
  
  const nudgeSelectedObjects = useCallback((direction: string, distance: number) => {
    if (selectedIds.length === 0) return;
    
    setCanvasObjects(prev => prev.map(obj => {
      if (!selectedIds.includes(obj.id)) return obj;
      
      let deltaX = 0, deltaY = 0;
      switch (direction) {
        case 'ArrowLeft': deltaX = -distance; break;
        case 'ArrowRight': deltaX = distance; break;
        case 'ArrowUp': deltaY = -distance; break;
        case 'ArrowDown': deltaY = distance; break;
      }
      
      return { ...obj, x: obj.x + deltaX, y: obj.y + deltaY };
    }));
    
    setTimeout(saveState, 10);
  }, [selectedIds, saveState]);

  // Drawing handlers
  const handleStageMouseDown = (e: any) => {
    if (activeTool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedIds([]);
      }
      return;
    }
    
    if (activeTool === 'pencil' || activeTool === 'eraser') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setCurrentPath([pos.x, pos.y]);
    } else if (activeTool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      const text = prompt('Enter text:');
      if (text) {
        const newText: CanvasObject = {
          id: generateId(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: text,
          fontSize: 20,
          rotation: 0,
          strokeColor: activeColor,
          strokeWidth: 0,
          fill: activeColor
        };
        setCanvasObjects(prev => [...prev, newText]);
        setTimeout(saveState, 10);
      }
    } else {
      // Shape tools
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      
      const newObject: CanvasObject = {
        id: generateId(),
        type: activeTool === 'rectangle' ? 'rect' : activeTool === 'ellipse' ? 'ellipse' : 'line',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        rotation: 0,
        strokeColor: activeColor,
        strokeWidth: strokeWidth
      };
      
      if (activeTool === 'line') {
        newObject.points = [0, 0, 0, 0];
      }
      
      setCanvasObjects(prev => [...prev, newObject]);
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!isDrawing) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (activeTool === 'pencil' || activeTool === 'eraser') {
      setCurrentPath(prev => [...prev, point.x, point.y]);
      
      // Draw on raster canvas
      const canvas = rasterCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d')!;
      ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.length >= 4) {
        const prevX = currentPath[currentPath.length - 4];
        const prevY = currentPath[currentPath.length - 3];
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      
      updateRasterImage();
    } else {
      // Update current shape being drawn
      setCanvasObjects(prev => {
        const objects = [...prev];
        const lastObject = objects[objects.length - 1];
        if (!lastObject) return objects;
        
        const startX = lastObject.x;
        const startY = lastObject.y;
        
        if (activeTool === 'rectangle') {
          lastObject.width = Math.abs(point.x - startX);
          lastObject.height = Math.abs(point.y - startY);
          lastObject.x = Math.min(startX, point.x);
          lastObject.y = Math.min(startY, point.y);
        } else if (activeTool === 'ellipse') {
          const radiusX = Math.abs(point.x - startX) / 2;
          const radiusY = Math.abs(point.y - startY) / 2;
          lastObject.width = radiusX * 2;
          lastObject.height = radiusY * 2;
          lastObject.x = Math.min(startX, point.x);
          lastObject.y = Math.min(startY, point.y);
        } else if (activeTool === 'line') {
          lastObject.points = [0, 0, point.x - startX, point.y - startY];
        }
        
        return objects;
      });
    }
  };

  const handleStageMouseUp = () => {
    if (isDrawing && (activeTool === 'pencil' || activeTool === 'eraser')) {
      setTimeout(saveState, 10);
    } else if (isDrawing) {
      setTimeout(saveState, 10);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    const previousState = history[historyIndex - 1];
    setHistoryIndex(prev => prev - 1);
    
    setCanvasObjects(previousState.objects);
    setSelectedIds([]);
    
    if (previousState.rasterData && rasterCanvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const ctx = rasterCanvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.drawImage(img, 0, 0);
        updateRasterImage();
      };
      img.src = previousState.rasterData;
    }
  }, [historyIndex, history, canvasSize.width, canvasSize.height, updateRasterImage]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    setHistoryIndex(prev => prev + 1);
    
    setCanvasObjects(nextState.objects);
    setSelectedIds([]);
    
    if (nextState.rasterData && rasterCanvasRef.current) {
      const img = new window.Image();
      img.onload = () => {
        const ctx = rasterCanvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.drawImage(img, 0, 0);
        updateRasterImage();
      };
      img.src = nextState.rasterData;
    }
  }, [historyIndex, history, canvasSize.width, canvasSize.height, updateRasterImage]);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setCanvasObjects([]);
      setSelectedIds([]);
      
      // Clear raster canvas
      if (rasterCanvasRef.current) {
        const ctx = rasterCanvasRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        updateRasterImage();
      }
      
      setTimeout(saveState, 10);
      toast("Canvas cleared!");
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2,
    });
    
    const link = document.createElement('a');
    link.download = `sketch-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Drawing exported successfully!");
  };

  // Handle object selection
  const handleObjectClick = (id: string, e: any) => {
    if (activeTool !== 'select') return;
    
    e.cancelBubble = true;
    
    if (e.evt.shiftKey) {
      // Add/remove from selection
      setSelectedIds(prev => 
        prev.includes(id) 
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
      );
    } else {
      // Select only this object
      setSelectedIds([id]);
    }
  };

  // Handle object transformation
  const handleObjectTransform = (id: string, newAttrs: any) => {
    setCanvasObjects(prev => prev.map(obj => 
      obj.id === id 
        ? { ...obj, ...newAttrs }
        : obj
    ));
    setTimeout(saveState, 10);
  };

  return (
    <div className="flex gap-4 h-full">
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
        onDelete={() => deleteSelectedObjects()}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={selectedIds.length > 0}
      />
      
      <div ref={containerRef} className="flex-1 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden bg-white">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleStageMouseDown}
          onMousemove={handleStageMouseMove}
          onMouseup={handleStageMouseUp}
        >
          {/* Raster Layer for brush/eraser */}
          <Layer ref={rasterLayerRef}>
            <Image
              ref={rasterImageRef}
              image={rasterImageData?.image()}
              x={0}
              y={0}
            />
          </Layer>
          
          {/* Objects Layer for shapes and text */}
          <Layer ref={objectsLayerRef}>
            {canvasObjects.map((obj) => {
              const isSelected = selectedIds.includes(obj.id);
              
              if (obj.type === 'rect') {
                return (
                  <Rect
                    key={obj.id}
                    x={obj.x}
                    y={obj.y}
                    width={obj.width || 0}
                    height={obj.height || 0}
                    rotation={obj.rotation}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth}
                    fill={obj.fill || 'transparent'}
                    draggable={activeTool === 'select'}
                    onClick={(e) => handleObjectClick(obj.id, e)}
                    onTransform={(e) => {
                      const node = e.target;
                      handleObjectTransform(obj.id, {
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation()
                      });
                    }}
                    onDragEnd={(e) => {
                      handleObjectTransform(obj.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              }
              
              if (obj.type === 'ellipse') {
                return (
                  <Ellipse
                    key={obj.id}
                    x={obj.x + (obj.width || 0) / 2}
                    y={obj.y + (obj.height || 0) / 2}
                    radiusX={(obj.width || 0) / 2}
                    radiusY={(obj.height || 0) / 2}
                    rotation={obj.rotation}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth}
                    fill={obj.fill || 'transparent'}
                    draggable={activeTool === 'select'}
                    onClick={(e) => handleObjectClick(obj.id, e)}
                    onTransform={(e) => {
                      const node = e.target as any;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      handleObjectTransform(obj.id, {
                        x: node.x() - (node.radiusX() * scaleX),
                        y: node.y() - (node.radiusY() * scaleY),
                        width: node.radiusX() * 2 * scaleX,
                        height: node.radiusY() * 2 * scaleY,
                        rotation: node.rotation()
                      });
                    }}
                    onDragEnd={(e) => {
                      const node = e.target as any;
                      handleObjectTransform(obj.id, {
                        x: node.x() - node.radiusX(),
                        y: node.y() - node.radiusY()
                      });
                    }}
                  />
                );
              }
              
              if (obj.type === 'line') {
                return (
                  <Line
                    key={obj.id}
                    x={obj.x}
                    y={obj.y}
                    points={obj.points || [0, 0, 100, 100]}
                    rotation={obj.rotation}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth}
                    draggable={activeTool === 'select'}
                    onClick={(e) => handleObjectClick(obj.id, e)}
                    onTransform={(e) => {
                      const node = e.target;
                      handleObjectTransform(obj.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation()
                      });
                    }}
                    onDragEnd={(e) => {
                      handleObjectTransform(obj.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              }
              
              if (obj.type === 'text') {
                return (
                  <Text
                    key={obj.id}
                    x={obj.x}
                    y={obj.y}
                    text={obj.text || ''}
                    fontSize={obj.fontSize || 20}
                    rotation={obj.rotation}
                    fill={obj.fill || obj.strokeColor}
                    draggable={activeTool === 'select'}
                    onClick={(e) => handleObjectClick(obj.id, e)}
                    onTransform={(e) => {
                      const node = e.target;
                      handleObjectTransform(obj.id, {
                        x: node.x(),
                        y: node.y(),
                        fontSize: (obj.fontSize || 20) * node.scaleX(),
                        rotation: node.rotation()
                      });
                    }}
                    onDragEnd={(e) => {
                      handleObjectTransform(obj.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                    onDblClick={() => {
                      const newText = prompt('Edit text:', obj.text);
                      if (newText !== null) {
                        handleObjectTransform(obj.id, { text: newText });
                      }
                    }}
                  />
                );
              }
              
              return null;
            })}
            
            {/* Transformer for selected objects */}
            <Transformer
              ref={transformerRef}
              nodes={selectedIds.length > 0 ? selectedIds.map(id => {
                const layer = objectsLayerRef.current;
                return layer?.findOne(`#${id}`);
              }).filter(Boolean) as any[] : []}
              keepRatio={false}
              enabledAnchors={[
                'top-left', 'top-center', 'top-right',
                'middle-right', 'middle-left',
                'bottom-left', 'bottom-center', 'bottom-right'
              ]}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};