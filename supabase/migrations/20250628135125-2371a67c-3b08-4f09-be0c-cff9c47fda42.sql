
-- Create crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  land_area DECIMAL(10,2) NOT NULL,
  land_unit TEXT NOT NULL CHECK (land_unit IN ('acres', 'hectares')),
  sowing_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create land_expenses table
CREATE TABLE public.land_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for crops table
CREATE POLICY "Users can view their own crops" 
  ON public.crops 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crops" 
  ON public.crops 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops" 
  ON public.crops 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops" 
  ON public.crops 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for expenses table
CREATE POLICY "Users can view expenses for their crops" 
  ON public.expenses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = expenses.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can create expenses for their crops" 
  ON public.expenses 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = expenses.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can update expenses for their crops" 
  ON public.expenses 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = expenses.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete expenses for their crops" 
  ON public.expenses 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = expenses.crop_id 
    AND crops.user_id = auth.uid()
  ));

-- Create RLS policies for income table
CREATE POLICY "Users can view income for their crops" 
  ON public.income 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = income.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can create income for their crops" 
  ON public.income 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = income.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can update income for their crops" 
  ON public.income 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = income.crop_id 
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete income for their crops" 
  ON public.income 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.crops 
    WHERE crops.id = income.crop_id 
    AND crops.user_id = auth.uid()
  ));

-- Create RLS policies for land_expenses table
CREATE POLICY "Users can view their own land expenses" 
  ON public.land_expenses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own land expenses" 
  ON public.land_expenses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own land expenses" 
  ON public.land_expenses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own land expenses" 
  ON public.land_expenses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_crops_user_id ON public.crops(user_id);
CREATE INDEX idx_expenses_crop_id ON public.expenses(crop_id);
CREATE INDEX idx_income_crop_id ON public.income(crop_id);
CREATE INDEX idx_land_expenses_user_id ON public.land_expenses(user_id);
