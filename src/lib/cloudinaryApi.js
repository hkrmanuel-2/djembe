/**
 * Cloudinary Integration for Djembe
 * Handles file uploads to Cloudinary with proper folder organization
 */

const CLOUDINARY_CLOUD_NAME = "dlvdj0xir"; // Djembe's cloud name
const CLOUDINARY_UPLOAD_PRESET = "djembe_assignments"; // Unsigned upload preset

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
  const {
    folder = "Djembe Assignment Submissions",
    public_id = null,
    onProgress = null,
  } = options;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    if (public_id) {
      formData.append("public_id", public_id);
    }

    // Add resource type based on file type
    const resourceType = file.type.startsWith("video/") ? "video" : "auto";

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
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
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
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
  // Create organized folder path
  const folder = "Djembe Assignment Submissions";

  // Create unique public_id with timestamp
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const public_id = `student_${studentId}/assignment_${assignmentId}/${timestamp}_${safeFileName}`;

  return uploadToCloudinary(file, {
    folder,
    public_id,
    onProgress,
  });
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

  const errors = [];

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
