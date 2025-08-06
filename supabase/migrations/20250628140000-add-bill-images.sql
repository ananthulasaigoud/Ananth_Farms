-- Add image fields to expenses table
ALTER TABLE public.expenses 
ADD COLUMN bill_image_url TEXT;

-- Add image fields to income table  
ALTER TABLE public.income 
ADD COLUMN bill_image_url TEXT;

-- Add image fields to land_expenses table
ALTER TABLE public.land_expenses 
ADD COLUMN bill_image_url TEXT; 