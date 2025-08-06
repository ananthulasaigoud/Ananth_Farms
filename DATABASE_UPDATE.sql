-- Update expenses table to support multiple images
ALTER TABLE public.expenses 
ALTER COLUMN bill_image_url TYPE TEXT[] USING 
  CASE 
    WHEN bill_image_url IS NULL THEN NULL
    ELSE ARRAY[bill_image_url]
  END;

-- Update income table to support multiple images
ALTER TABLE public.income 
ALTER COLUMN bill_image_url TYPE TEXT[] USING 
  CASE 
    WHEN bill_image_url IS NULL THEN NULL
    ELSE ARRAY[bill_image_url]
  END;

-- Update land_expenses table to support multiple images
ALTER TABLE public.land_expenses 
ALTER COLUMN bill_image_url TYPE TEXT[] USING 
  CASE 
    WHEN bill_image_url IS NULL THEN NULL
    ELSE ARRAY[bill_image_url]
  END; 