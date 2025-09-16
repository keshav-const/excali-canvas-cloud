import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Download, 
  Eraser, 
  Palette, 
  PenTool, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  Undo, 
  Redo,
  Trash2
} from "lucide-react";

export type DrawingTool = "pencil" | "rectangle" | "circle" | "line" | "text" | "eraser" | "select";

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PRESET_COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

const TOOLS = [
  { id: "pencil" as const, icon: PenTool, label: "Pencil" },
  { id: "rectangle" as const, icon: Square, label: "Rectangle" },
  { id: "circle" as const, icon: Circle, label: "Circle" },
  { id: "line" as const, icon: Minus, label: "Line" },
  { id: "text" as const, icon: Type, label: "Text" },
  { id: "eraser" as const, icon: Eraser, label: "Eraser" },
];

export const DrawingToolbar = ({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}: DrawingToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-6">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === tool.id ? "default" : "ghost"}
                      size="icon"
                      onClick={() => onToolChange(tool.id)}
                      className={`h-10 w-10 ${
                        activeTool === tool.id 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tool.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-600" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="h-10 w-10 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30"
                >
                  <Undo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="h-10 w-10 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30"
                >
                  <Redo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-600" />

          {/* Color Picker */}
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-gray-300" />
            <div className="flex gap-1">
              {PRESET_COLORS.map((color) => (
                <Tooltip key={color}>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        activeColor === color 
                          ? "border-blue-400 ring-2 ring-blue-400/30" 
                          : "border-gray-500 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onColorChange(color)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-gray-500 cursor-pointer bg-transparent"
            />
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-600" />

          {/* Stroke Width */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <span className="text-sm font-medium text-gray-300">Width:</span>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              max={20}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-400 w-8">{strokeWidth}px</span>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-600" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-10 w-10 text-gray-300 hover:text-white hover:bg-red-600/20"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExport}
                  className="h-10 w-10 text-gray-300 hover:text-white hover:bg-green-600/20"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export PNG</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};