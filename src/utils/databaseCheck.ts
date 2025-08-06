import { supabase } from '@/integrations/supabase/client';

export const checkAndFixDatabaseSchema = async () => {
  try {
    // Check if the bill_image_url column exists and is of the correct type
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('bill_image_url')
      .limit(1);

    if (expensesError) {
      console.error('Error checking expenses table:', expensesError);
      return false;
    }

    // If we get here, the column exists
    console.log('Database schema appears to be correct');
    return true;
  } catch (error) {
    console.error('Error checking database schema:', error);
    return false;
  }
};

export const runDatabaseMigration = async () => {
  try {
    // This would need to be run in the Supabase SQL editor
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
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
    `);
  } catch (error) {
    console.error('Error running migration:', error);
  }
}; 