/**
 * Cloudinary Integration for Djembe
 * Handles file uploads to Cloudinary with proper folder organization
 */

const CLOUDINARY_CLOUD_NAME = "dlvdj0xir"; // Djembe's cloud name
const CLOUDINARY_UPLOAD_PRESET = "djembe"; // Unsigned upload preset

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path in Cloudinary
 * @param {string} options.public_id - Custom public ID (optional)
 * @param {Function} options.onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result with secure_url
 */
export async function uploadToCloudinary(file, options = {}) {
  console.log("[CLOUDINARY] Starting uploadToCloudinary");
  const {
    folder = "Djembe Assignment Submissions",
    public_id = null,
    onProgress = null,
  } = options;

  console.log("[CLOUDINARY] Upload options:", {
    folder,
    public_id,
    hasOnProgress: !!onProgress,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type
  });

  try {
    console.log("[CLOUDINARY] Creating FormData");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    // Only append folder if provided (preset may have asset folder configured)
    if (folder) {
      formData.append("folder", folder);
    }

    if (public_id) {
      formData.append("public_id", public_id);
      console.log("[CLOUDINARY] Added public_id:", public_id);
    }

    // Add resource type based on file type
    // Try "auto" for all files first - Cloudinary will detect the type automatically
    // Using "auto" instead of "raw" for audio to avoid potential authentication issues
    let resourceType = "auto";
    if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else if (file.type.startsWith("image/")) {
      resourceType = "image";
    }
    // Audio files: using "auto" instead of "raw" to avoid auth issues with unsigned presets
    // Cloudinary will still handle audio files correctly with "auto"
    console.log("[CLOUDINARY] Resource type:", resourceType, "for file type:", file.type);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    console.log("[CLOUDINARY] Upload URL:", uploadUrl);
    console.log("[CLOUDINARY] Cloud name:", CLOUDINARY_CLOUD_NAME);
    console.log("[CLOUDINARY] Upload preset:", CLOUDINARY_UPLOAD_PRESET);
    console.log("[CLOUDINARY] Preset name length:", CLOUDINARY_UPLOAD_PRESET.length);
    console.log("[CLOUDINARY] Preset name char codes:", JSON.stringify(Array.from(CLOUDINARY_UPLOAD_PRESET).map(c => ({ char: c, code: c.charCodeAt(0) }))));
    console.log("[CLOUDINARY] FormData contents:", {
      hasFile: formData.has("file"),
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: folder,
      hasPublicId: !!public_id
    });
    
    // Log all FormData entries for debugging
    console.log("[CLOUDINARY] All FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const xhr = new XMLHttpRequest();
    console.log("[CLOUDINARY] XMLHttpRequest created");

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            console.log(`[CLOUDINARY] Upload progress: ${percentComplete}% (${e.loaded}/${e.total} bytes)`);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener("load", () => {
        console.log("[CLOUDINARY] XHR load event fired, status:", xhr.status);
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log("[CLOUDINARY] Upload successful, response:", {
              secure_url: response.secure_url,
              public_id: response.public_id,
              resource_type: response.resource_type,
              format: response.format,
              bytes: response.bytes
            });
            resolve({
              success: true,
              data: {
                secure_url: response.secure_url,
                public_id: response.public_id,
                resource_type: response.resource_type,
                format: response.format,
                bytes: response.bytes,
                width: response.width,
                height: response.height,
                created_at: response.created_at,
              },
            });
          } catch (parseError) {
            console.error("[CLOUDINARY] Error parsing response:", parseError);
            console.error("[CLOUDINARY] Response text:", xhr.responseText);
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        } else {
          console.error("[CLOUDINARY] Upload failed with status:", xhr.status);
          console.error("[CLOUDINARY] Response text:", xhr.responseText);
          
          // Check for x-cld-error header (Cloudinary's detailed error message)
          const cldError = xhr.getResponseHeader("x-cld-error");
          console.error("[CLOUDINARY] x-cld-error header:", cldError);
          
          let errorMessage = `Upload failed with status ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error?.message) {
              errorMessage = errorResponse.error.message;
              console.error("[CLOUDINARY] Error details:", errorResponse.error);
              
              // Provide helpful error messages for common issues
              if (xhr.status === 401) {
                errorMessage = `Cloudinary 401 Error - "Unknown API key"
                
This error on an unsigned preset usually means:
1. The preset "${CLOUDINARY_UPLOAD_PRESET}" doesn't exist or isn't accessible
2. The preset name has a typo or hidden characters
3. The preset is in a different Cloudinary account
4. Account-level restrictions are blocking unsigned uploads
5. The cloud name "${CLOUDINARY_CLOUD_NAME}" is incorrect

TROUBLESHOOTING:
- Check Network tab → Response Headers → "x-cld-error" for detailed error
- Verify preset name matches exactly (copy-paste from Cloudinary dashboard)
- Try creating a NEW preset with a simple name like "test_upload"
- Check Cloudinary Dashboard → Settings → Security for any restrictions
- Verify you're logged into the correct Cloudinary account

Original error: ${errorResponse.error.message}
${cldError ? `\nDetailed error: ${cldError}` : ''}`;
              }
            }
          } catch (e) {
            // If we can't parse the error, use the default message
            console.error("[CLOUDINARY] Could not parse error response:", e);
          }
          
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener("error", (e) => {
        console.error("[CLOUDINARY] XHR error event fired:", e);
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        console.warn("[CLOUDINARY] XHR upload aborted");
        reject(new Error("Upload aborted"));
      });

      console.log("[CLOUDINARY] Opening POST request to:", uploadUrl);
      xhr.open("POST", uploadUrl);
      console.log("[CLOUDINARY] Sending FormData");
      xhr.send(formData);
      console.log("[CLOUDINARY] FormData sent, waiting for response");
    });
  } catch (error) {
    console.error("[CLOUDINARY] Error in uploadToCloudinary:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload an assignment submission file
 * @param {File} file - The file to upload
 * @param {string} studentId - Student UUID
 * @param {string} assignmentId - Assignment UUID
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadAssignmentSubmission(
  file,
  studentId,
  assignmentId,
  onProgress = null
) {
  console.log("[CLOUDINARY] Starting uploadAssignmentSubmission");
  console.log("[CLOUDINARY] Parameters:", {
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
    studentId,
    assignmentId,
    hasOnProgress: !!onProgress
  });

  // Create unique public_id with timestamp
  // The preset already has asset folder configured, so we don't need to send folder parameter
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Include full path in public_id - the preset's asset folder will be prepended automatically
  const public_id = `student_${studentId}/assignment_${assignmentId}/${timestamp}_${safeFileName}`;
  
  console.log("[CLOUDINARY] Generated public_id:", public_id);
  console.log("[CLOUDINARY] Calling uploadToCloudinary (no folder param - using preset's asset folder)");
  console.log("[CLOUDINARY] NOTE: Trying upload with minimal parameters to test preset");

  try {
    // Try without public_id first to see if that's causing the issue
    const result = await uploadToCloudinary(file, {
      folder: null, // Don't send folder - let preset's asset folder handle it
      public_id: null, // Temporarily remove public_id to test if that's causing the 401
      onProgress,
    });
    console.log("[CLOUDINARY] uploadAssignmentSubmission result:", {
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });
    return result;
  } catch (error) {
    console.error("[CLOUDINARY] Error in uploadAssignmentSubmission:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

/**
 * Get Cloudinary URL from public_id
 * @param {string} public_id - Cloudinary public ID
 * @param {Object} transformations - Cloudinary transformations (optional)
 * @returns {string} Full Cloudinary URL
 */
export function getCloudinaryUrl(public_id, transformations = {}) {
  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`;

  // Add transformations if provided
  if (Object.keys(transformations).length > 0) {
    const transformString = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(",");
    url += `image/upload/${transformString}/`;
  } else {
    url += "image/upload/";
  }

  url += public_id;
  return url;
}

/**
 * Delete a file from Cloudinary (requires backend endpoint)
 * @param {string} public_id - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(public_id) {
  // Note: Deletion requires authentication and should be done via backend
  // This function is a placeholder for future implementation
  console.warn("Cloudinary deletion requires backend API endpoint");
  return {
    success: false,
    error: "Deletion not implemented - requires backend endpoint",
  };
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
  console.log("[CLOUDINARY] Starting file validation");
  console.log("[CLOUDINARY] File info:", {
    name: file?.name,
    size: file?.size,
    type: file?.type
  });

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

  console.log("[CLOUDINARY] Validation options:", {
    maxSizeMB,
    allowedTypesCount: allowedTypes.length
  });

  const errors = [];

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  console.log("[CLOUDINARY] File size check:", {
    fileSizeMB: fileSizeMB.toFixed(2),
    maxSizeMB,
    passes: fileSizeMB <= maxSizeMB
  });
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`);
  }

  // Check file type
  console.log("[CLOUDINARY] File type check:", {
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
  console.log("[CLOUDINARY] Validation result:", result);
  return result;
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
