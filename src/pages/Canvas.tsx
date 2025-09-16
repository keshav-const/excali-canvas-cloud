import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Palette } from 'lucide-react';
import { DrawingCanvas } from '@/components/drawing/DrawingCanvas';

const Canvas = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Palette className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold">ExcaliSketch Canvas</h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {user ? `Drawing as ${user.email}` : 'Drawing as Guest'}
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <DrawingCanvas />
        </div>
      </main>
    </div>
  );
};

export default Canvas;