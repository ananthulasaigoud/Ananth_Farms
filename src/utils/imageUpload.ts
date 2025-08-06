import { supabase } from '@/integrations/supabase/client';

export const uploadBillImage = async (file: File, userId: string, type: 'expense' | 'income' | 'land_expense'): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename with simpler structure
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${userId}_${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage with simpler path
    const { data, error } = await supabase.storage
      .from('farm-bills')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error details:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('farm-bills')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleBillImages = async (files: File[], userId: string, type: 'expense' | 'income' | 'land_expense'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadBillImage(file, userId, type));
    const results = await Promise.allSettled(uploadPromises);
    
    const uploadedUrls: string[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        uploadedUrls.push(result.value);
      } else {
        errors.push(`Failed to upload ${files[index].name}`);
      }
    });
    
    if (errors.length > 0) {
      console.warn('Some uploads failed:', errors);
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

export const deleteBillImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1]; // Get just the filename

    const { error } = await supabase.storage
      .from('farm-bills')
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const deleteMultipleBillImages = async (imageUrls: string[]): Promise<void> => {
  try {
    const deletePromises = imageUrls.map(url => deleteBillImage(url));
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
}; 