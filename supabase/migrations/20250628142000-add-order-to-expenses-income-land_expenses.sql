-- Migration: Add 'order' column to expenses, income, and land_expenses tables

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

ALTER TABLE public.income 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

ALTER TABLE public.land_expenses 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Optionally, you may want to backfill existing rows with a default order value
-- Here is an example that sets the order based on creation time (oldest first)

WITH ordered_expenses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM public.expenses
)
UPDATE public.expenses SET "order" = ordered_expenses.rn FROM ordered_expenses WHERE public.expenses.id = ordered_expenses.id;

WITH ordered_income AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM public.income
)
UPDATE public.income SET "order" = ordered_income.rn FROM ordered_income WHERE public.income.id = ordered_income.id;

WITH ordered_land_expenses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn FROM public.land_expenses
)
UPDATE public.land_expenses SET "order" = ordered_land_expenses.rn FROM ordered_land_expenses WHERE public.land_expenses.id = ordered_land_expenses.id; 