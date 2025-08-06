# Supabase Storage Setup for Bill Images

To enable bill image uploads in the FarmLog app, you need to set up a storage bucket in your Supabase project.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `farm-bills`
   - **Public bucket**: ✅ Check this (so images can be viewed)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

### Policy 1: Users can upload their own images
```sql
CREATE POLICY "Users can upload their own bill images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'farm-bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 2: Users can view their own images
```sql
CREATE POLICY "Users can view their own bill images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'farm-bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Users can update their own images
```sql
CREATE POLICY "Users can update their own bill images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'farm-bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 4: Users can delete their own images
```sql
CREATE POLICY "Users can delete their own bill images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'farm-bills' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Run Database Migration

Run the migration to add the `bill_image_url` fields to your tables:

```bash
npx supabase db push
```

Or manually run the SQL:

```sql
-- Add image fields to expenses table
ALTER TABLE public.expenses 
ADD COLUMN bill_image_url TEXT;

-- Add image fields to income table  
ALTER TABLE public.income 
ADD COLUMN bill_image_url TEXT;

-- Add image fields to land_expenses table
ALTER TABLE public.land_expenses 
ADD COLUMN bill_image_url TEXT;
```

## Step 4: Test the Setup

1. Start your development server
2. Try adding an expense or income with a bill image
3. Check that the image appears in the crop detail modal
4. Verify that images are stored in the `farm-bills` bucket in your Supabase dashboard

## File Structure

Images will be stored with the following structure:
```
farm-bills/
├── {user_id}/
│   ├── expense_{user_id}_{timestamp}.jpg
│   ├── income_{user_id}_{timestamp}.png
│   └── land_expense_{user_id}_{timestamp}.jpg
```

## Security Notes

- Images are organized by user ID for proper isolation
- Only authenticated users can upload/view their own images
- File size is limited to 5MB
- Only image files are allowed
- Images are stored with unique timestamps to prevent conflicts

## Troubleshooting

If you encounter issues:

1. **Upload fails**: Check that the storage bucket exists and policies are set correctly
2. **Images don't display**: Verify the bucket is public and policies allow SELECT
3. **Permission errors**: Ensure the user is authenticated and policies include the correct user ID
4. **File too large**: Check the bucket's file size limit setting 