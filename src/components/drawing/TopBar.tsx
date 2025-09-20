import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface SelectedElement {
  id: string;
  strokeColor: string;
  strokeWidth: number;
  type: string;
}

interface TopBarProps {
  selectedElement: SelectedElement | null;
  zoom: number;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

const PRESET_COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

const TopBar = ({ selectedElement, zoom, onStrokeColorChange, onStrokeWidthChange }: TopBarProps) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center gap-4 shadow-2xl z-20">
      {/* Zoom Display */}
      <div className="text-sm text-gray-400 px-2 font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Property Controls - only show if an element is selected */}
      {selectedElement && (
        <>
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
          
          {/* Element Type */}
          <div className="text-sm text-gray-300 capitalize font-medium">
            {selectedElement.type}
          </div>
          
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
          
          {/* Stroke Color */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400 font-medium">Color</label>
            <div className="flex items-center gap-2">
              {/* Current Color Display */}
              <div 
                className="w-8 h-8 rounded border-2 border-gray-500 cursor-pointer"
                style={{ backgroundColor: selectedElement.strokeColor }}
              />
              
              {/* Preset Colors */}
              <div className="flex gap-1">
                {PRESET_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border transition-all ${
                      selectedElement.strokeColor === color 
                        ? "border-blue-400 ring-1 ring-blue-400/50 scale-110" 
                        : "border-gray-500 hover:border-gray-400 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onStrokeColorChange(color)}
                  />
                ))}
              </div>
              
              {/* Custom Color Picker */}
              <input
                type="color"
                value={selectedElement.strokeColor}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-gray-500 cursor-pointer bg-transparent"
              />
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6 bg-gray-600" />

          {/* Stroke Width */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400 font-medium">Width</label>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Slider
                value={[selectedElement.strokeWidth]}
                onValueChange={(value) => onStrokeWidthChange(value[0])}
                max={20}
                min={1}
                step={1}
                className="w-20"
              />
              <span className="text-xs text-gray-400 font-mono min-w-[32px]">
                {selectedElement.strokeWidth}px
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar;