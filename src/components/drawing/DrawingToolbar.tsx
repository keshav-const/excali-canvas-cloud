import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Eraser, Palette } from "lucide-react";

interface DrawingToolbarProps {
  activeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  onExport: () => void;
}

const PRESET_COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

export const DrawingToolbar = ({
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  onExport,
}: DrawingToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium">Color:</span>
        <div className="flex gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 ${
                activeColor === color ? "border-primary" : "border-muted"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <span className="text-sm font-medium">Width:</span>
        <Slider
          value={[strokeWidth]}
          onValueChange={(value) => onStrokeWidthChange(value[0])}
          max={20}
          min={1}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8">{strokeWidth}px</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-auto">
        <Button variant="outline" onClick={onClear}>
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export PNG
        </Button>
      </div>
    </div>
  );
};