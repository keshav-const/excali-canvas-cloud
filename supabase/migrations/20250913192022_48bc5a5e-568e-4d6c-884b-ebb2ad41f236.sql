-- Create sketches table
CREATE TABLE public.sketches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Sketch',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sketches ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own sketches" 
ON public.sketches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sketches" 
ON public.sketches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sketches" 
ON public.sketches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sketches" 
ON public.sketches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow guest users to create sketches (without user_id)
CREATE POLICY "Allow guest sketch creation" 
ON public.sketches 
FOR INSERT 
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow guest sketch access" 
ON public.sketches 
FOR SELECT 
USING (user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sketches_updated_at
  BEFORE UPDATE ON public.sketches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_sketches_user_id ON public.sketches(user_id);
CREATE INDEX idx_sketches_created_at ON public.sketches(created_at DESC);