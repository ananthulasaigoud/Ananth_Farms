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

-- Add payment status enum (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid');
    END IF;
END $$;

-- Update expenses table with payment fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'payment_status') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_status payment_status DEFAULT 'unpaid';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'paid_amount') THEN
        ALTER TABLE public.expenses ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'payment_date') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'payment_method') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_method VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'payment_notes') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_notes TEXT;
    END IF;
END $$;

-- Update income table with payment fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income' AND column_name = 'payment_status') THEN
        ALTER TABLE public.income ADD COLUMN payment_status payment_status DEFAULT 'paid';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income' AND column_name = 'paid_amount') THEN
        ALTER TABLE public.income ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income' AND column_name = 'payment_date') THEN
        ALTER TABLE public.income ADD COLUMN payment_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income' AND column_name = 'payment_method') THEN
        ALTER TABLE public.income ADD COLUMN payment_method VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income' AND column_name = 'payment_notes') THEN
        ALTER TABLE public.income ADD COLUMN payment_notes TEXT;
    END IF;
END $$;

-- Update land_expenses table with payment fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_expenses' AND column_name = 'payment_status') THEN
        ALTER TABLE public.land_expenses ADD COLUMN payment_status payment_status DEFAULT 'unpaid';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_expenses' AND column_name = 'paid_amount') THEN
        ALTER TABLE public.land_expenses ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_expenses' AND column_name = 'payment_date') THEN
        ALTER TABLE public.land_expenses ADD COLUMN payment_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_expenses' AND column_name = 'payment_method') THEN
        ALTER TABLE public.land_expenses ADD COLUMN payment_method VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_expenses' AND column_name = 'payment_notes') THEN
        ALTER TABLE public.land_expenses ADD COLUMN payment_notes TEXT;
    END IF;
END $$;

-- Set default values for existing data (only if payment_status is NULL)
UPDATE public.expenses 
SET payment_status = 'paid', 
    paid_amount = amount 
WHERE payment_status IS NULL;

UPDATE public.income 
SET payment_status = 'paid', 
    paid_amount = amount 
WHERE payment_status IS NULL;

UPDATE public.land_expenses 
SET payment_status = 'unpaid', 
    paid_amount = 0 
WHERE payment_status IS NULL; 