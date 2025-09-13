import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Sketch {
  id: string;
  user_id: string | null;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export const useSketchAPI = () => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token 
      ? { 'Authorization': `Bearer ${session.access_token}` }
      : {};
  };

  const createSketch = async (title: string, content: any): Promise<Sketch | null> => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      const { data, error } = await supabase.functions.invoke('sketches', {
        method: 'POST',
        body: { title, content },
        headers
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create sketch",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Sketch created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating sketch:', error);
      toast({
        title: "Error",
        description: "Failed to create sketch",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSketch = async (id: string): Promise<Sketch | null> => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      const { data, error } = await supabase.functions.invoke('sketches', {
        method: 'GET',
        body: null,
        headers
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sketch",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching sketch:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sketch",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserSketches = async (): Promise<Sketch[]> => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      const { data, error } = await supabase.functions.invoke('sketches', {
        method: 'GET',
        body: null,
        headers
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sketches",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching sketches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sketches",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateSketch = async (id: string, title?: string, content?: any): Promise<Sketch | null> => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      const body: any = {};
      if (title !== undefined) body.title = title;
      if (content !== undefined) body.content = content;
      
      const { data, error } = await supabase.functions.invoke('sketches', {
        method: 'PUT',
        body,
        headers
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update sketch",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Sketch updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating sketch:', error);
      toast({
        title: "Error",
        description: "Failed to update sketch",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSketch = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      
      const { error } = await supabase.functions.invoke('sketches', {
        method: 'DELETE',
        body: null,
        headers
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete sketch",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Sketch deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting sketch:', error);
      toast({
        title: "Error",
        description: "Failed to delete sketch",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSketch,
    getSketch,
    getUserSketches,
    updateSketch,
    deleteSketch,
  };
};