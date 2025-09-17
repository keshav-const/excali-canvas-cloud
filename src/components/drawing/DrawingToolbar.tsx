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
  Trash2,
  MousePointer2
} from "lucide-react";

export type DrawingTool = "pencil" | "rectangle" | "ellipse" | "line" | "text" | "eraser" | "select";

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
  onDelete: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

const PRESET_COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

const DRAWING_TOOLS = [
  { id: "pencil" as const, icon: PenTool, label: "Pencil (P)", shortcut: "P" },
  { id: "eraser" as const, icon: Eraser, label: "Eraser (E)", shortcut: "E" },
];

const SHAPE_TOOLS = [
  { id: "rectangle" as const, icon: Square, label: "Rectangle (R)", shortcut: "R" },
  { id: "ellipse" as const, icon: Circle, label: "Ellipse (O)", shortcut: "O" },
  { id: "line" as const, icon: Minus, label: "Line (L)", shortcut: "L" },
  { id: "text" as const, icon: Type, label: "Text (T)", shortcut: "T" },
];

const SELECTION_TOOLS = [
  { id: "select" as const, icon: MousePointer2, label: "Select (V)", shortcut: "V" },
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
  onDelete,
  canUndo,
  canRedo,
  hasSelection,
}: DrawingToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-2xl min-w-[80px] max-w-[80px] flex flex-col gap-4">
        {/* Drawing Tools */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">Draw</div>
          {DRAWING_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToolChange(tool.id)}
                    className={`h-12 w-12 rounded-lg transition-all ${
                      activeTool === tool.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Shape Tools */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">Shapes</div>
          {SHAPE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToolChange(tool.id)}
                    className={`h-12 w-12 rounded-lg transition-all ${
                      activeTool === tool.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Selection Tools */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">Select</div>
          {SELECTION_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToolChange(tool.id)}
                    className={`h-12 w-12 rounded-lg transition-all ${
                      activeTool === tool.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* Delete Button (only when selection exists) */}
          {hasSelection && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-12 w-12 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 border border-red-600/30"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Delete Selected (Del)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-2" />

        {/* History Actions */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">History</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-12 w-12 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30 border border-gray-600"
              >
                <Undo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-12 w-12 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30 border border-gray-600"
              >
                <Redo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-2" />

        {/* Color & Settings */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">Color</div>
          
          {/* Current Color Display */}
          <div 
            className="w-12 h-8 rounded border-2 border-gray-500 mx-auto"
            style={{ backgroundColor: activeColor }}
          />
          
          {/* Preset Colors */}
          <div className="grid grid-cols-3 gap-1">
            {PRESET_COLORS.slice(0, 6).map((color) => (
              <Tooltip key={color}>
                <TooltipTrigger asChild>
                  <button
                    className={`w-6 h-6 rounded border transition-all ${
                      activeColor === color 
                        ? "border-blue-400 ring-1 ring-blue-400/50" 
                        : "border-gray-500 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{color}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-8 rounded border border-gray-500 cursor-pointer bg-transparent mx-auto"
          />
        </div>

        {/* Stroke Width */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-400 mb-1">Width</div>
          <div className="px-2">
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-full"
              orientation="vertical"
            />
          </div>
          <span className="text-xs text-gray-400 text-center">{strokeWidth}px</span>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-2" />

        {/* Canvas Actions */}
        <div className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-12 w-12 rounded-lg text-green-400 hover:text-white hover:bg-green-600/20 border border-green-600/30"
              >
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Export PNG</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-12 w-12 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 border border-red-600/30"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};