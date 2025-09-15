import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Palette } from 'lucide-react';

const Canvas = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Palette className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">ExcaliSketch Canvas</h1>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {user ? `Drawing as ${user.email}` : 'Drawing as Guest'}
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-lg border-2 border-dashed border-muted h-96 flex items-center justify-center">
            <div className="text-center">
              <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Canvas Coming Soon</h2>
              <p className="text-muted-foreground mb-4">
                This is where the drawing canvas will be implemented.
              </p>
              <div className="text-sm text-muted-foreground">
                Features to add: Drawing tools, layers, save/load, export
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Canvas;