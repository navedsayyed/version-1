// Firebase Storage services for image upload and management
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { storage } from './firebase';

// Upload a user profile image
export const uploadProfileImage = async (userId, uri) => {
  try {
    const path = `user-avatars/${userId}`;
    return uploadImage(uri, path);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { error };
  }
};

// Upload a complaint image
export const uploadComplaintImage = async (complaintId, uri, index = 0) => {
  try {
    const timestamp = Date.now();
    const path = `complaints/${complaintId}/${timestamp}_${index}`;
    return uploadImage(uri, path);
  } catch (error) {
    console.error('Error uploading complaint image:', error);
    return { error };
  }
};

// Upload a completion evidence image
export const uploadCompletionImage = async (complaintId, uri) => {
  try {
    const timestamp = Date.now();
    const path = `completions/${complaintId}/${timestamp}`;
    return uploadImage(uri, path);
  } catch (error) {
    console.error('Error uploading completion image:', error);
    return { error };
  }
};

// Generic image upload function
export const uploadImage = async (uri, path) => {
  try {
    // Validate URI
    if (!uri || typeof uri !== 'string') {
      console.error('Invalid image URI:', uri);
      return { error: new Error('Invalid image URI') };
    }

    // Get blob from URI
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { downloadURL, path };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { error };
  }
};

// Delete an image
export const deleteImage = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { error };
  }
};

// Upload multiple complaint images at once
export const uploadMultipleComplaintImages = async (complaintId, uris) => {
  try {
    // Validate complaintId and uris
    if (!complaintId) {
      return { error: new Error('Invalid complaint ID'), downloadURLs: [] };
    }
    
    if (!uris || !Array.isArray(uris) || uris.length === 0) {
      return { error: new Error('No valid images to upload'), downloadURLs: [] };
    }
    
    // Filter valid URIs
    const validUris = uris.filter(uri => uri && typeof uri === 'string');
    
    if (validUris.length === 0) {
      return { error: new Error('No valid image URIs provided'), downloadURLs: [] };
    }
    
    const uploadPromises = validUris.map((uri, index) => 
      uploadComplaintImage(complaintId, uri, index)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Filter out any failed uploads
    const successful = results.filter(result => !result.error && result.downloadURL);
    const downloadURLs = successful.map(result => result.downloadURL);
    
    if (successful.length === 0) {
      return { error: new Error('All image uploads failed'), downloadURLs: [] };
    }
    
    return { downloadURLs };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return { error, downloadURLs: [] };
  }
};