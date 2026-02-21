/**
 * Supabase Storage Integration for Djembe
 * Handles file uploads to Supabase Storage (free alternative to Cloudinary)
 */

import { supabase } from './supabase';

const STORAGE_BUCKET = 'assignment-submissions'; // Bucket name in Supabase Storage

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "audio/mpeg",
      "audio/wav",
      "audio/mp3",
      "video/mp4",
      "video/quicktime",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  } = options;

  console.log("[STORAGE] Starting file validation");
  console.log("[STORAGE] File info:", {
    name: file?.name,
    size: file?.size,
    type: file?.type
  });

  const errors = [];

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  console.log("[STORAGE] File size check:", {
    fileSizeMB: fileSizeMB.toFixed(2),
    maxSizeMB,
    passes: fileSizeMB <= maxSizeMB
  });
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`);
  }

  // Check file type
  console.log("[STORAGE] File type check:", {
    fileType: file.type,
    isAllowed: allowedTypes.includes(file.type)
  });
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  const result = {
    valid: errors.length === 0,
    errors,
  };
  console.log("[STORAGE] Validation result:", result);
  return result;
}

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} studentId - Student UUID
 * @param {string} assignmentId - Assignment UUID
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result with public URL
 */
export async function uploadAssignmentSubmission(
  file,
  studentId,
  assignmentId,
  onProgress = null
) {
  console.log("[STORAGE] Starting uploadAssignmentSubmission");
  console.log("[STORAGE] Parameters:", {
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
    studentId,
    assignmentId,
    hasOnProgress: !!onProgress
  });

  try {
    // Create organized file path
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `student_${studentId}/assignment_${assignmentId}/${timestamp}_${safeFileName}`;
    
    console.log("[STORAGE] File path:", filePath);
    console.log("[STORAGE] Uploading to bucket:", STORAGE_BUCKET);

    // Upload file to Supabase Storage
    console.log("[STORAGE] Attempting upload to bucket:", STORAGE_BUCKET);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("[STORAGE] Upload error:", error);
      
      // Provide helpful error messages
      if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
        throw new Error(`Storage bucket "${STORAGE_BUCKET}" not found. Please create it in Supabase Dashboard → Storage. See SUPABASE_STORAGE_SETUP.md for instructions.`);
      }
      if (error.message?.includes('new row violates row-level security')) {
        throw new Error(`Permission denied. Please check Storage policies in Supabase Dashboard. See SUPABASE_STORAGE_SETUP.md for setup instructions.`);
      }
      throw error;
    }

    console.log("[STORAGE] Upload successful, data:", data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log("[STORAGE] Public URL:", publicUrl);

    return {
      success: true,
      data: {
        secure_url: publicUrl,
        public_url: publicUrl,
        path: filePath,
        file_name: file.name,
      },
    };
  } catch (error) {
    console.error("[STORAGE] Error in uploadAssignmentSubmission:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

/**
 * Get file type display name
 * @param {string} mimeType - MIME type
 * @returns {string} Display name
 */
export function getFileTypeDisplay(mimeType) {
  const typeMap = {
    "image/jpeg": "JPEG Image",
    "image/jpg": "JPG Image",
    "image/png": "PNG Image",
    "image/gif": "GIF Image",
    "application/pdf": "PDF Document",
    "audio/mpeg": "MP3 Audio",
    "audio/wav": "WAV Audio",
    "audio/mp3": "MP3 Audio",
    "video/mp4": "MP4 Video",
    "video/quicktime": "QuickTime Video",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
    "application/vnd.ms-powerpoint": "PowerPoint Presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint Presentation",
  };

  return typeMap[mimeType] || "Unknown File Type";
}
