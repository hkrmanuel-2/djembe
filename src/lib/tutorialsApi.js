import { supabase } from "./supabase";

/**
 * Tutorials API
 * Handles all tutorial-related database operations
 */

// ============================================
// STUDENT/TEACHER - VIEW TUTORIALS
// ============================================

/**
 * Get tutorials filtered by audience and category
 * @param {Object} filters - Filter options
 * @param {string} filters.targetAudience - 'student', 'teacher', or 'both'
 * @param {string} filters.category - Category to filter by
 * @param {string} filters.difficulty - Difficulty level to filter by
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function getTutorials(filters = {}) {
  try {
    let query = supabase
      .from("tutorials")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    // Filter by target audience (include 'both')
    if (filters.targetAudience) {
      query = query.in("target_audience", [filters.targetAudience, "both"]);
    }

    // Filter by category
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      query = query.eq("difficulty_level", filters.difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Get tutorials error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Get single tutorial by ID
 * @param {string} tutorialId - Tutorial UUID
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function getTutorial(tutorialId) {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("id", tutorialId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get tutorial error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Get tutorials grouped by category
 * @param {string} targetAudience - 'student' or 'teacher'
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function getTutorialsByCategory(targetAudience) {
  try {
    const { data, error } = await getTutorials({ targetAudience });

    if (error) throw error;

    // Group by category
    const grouped = {};
    data.forEach((tutorial) => {
      if (!grouped[tutorial.category]) {
        grouped[tutorial.category] = [];
      }
      grouped[tutorial.category].push(tutorial);
    });

    return { data: grouped, error: null };
  } catch (error) {
    console.error("Get tutorials by category error:", error);
    return { data: {}, error: error.message };
  }
}

/**
 * Increment view count for a tutorial
 * @param {string} tutorialId - Tutorial UUID
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function incrementViewCount(tutorialId) {
  try {
    const { error } = await supabase.rpc("increment_tutorial_views", {
      tutorial_id: tutorialId,
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Increment view count error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Search tutorials by title or description
 * @param {string} query - Search query
 * @param {string} targetAudience - 'student' or 'teacher'
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function searchTutorials(query, targetAudience) {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("is_published", true)
      .in("target_audience", [targetAudience, "both"])
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Search tutorials error:", error);
    return { data: [], error: error.message };
  }
}

// ============================================
// TEACHER - MANAGE TUTORIALS
// ============================================

/**
 * Create a new tutorial (teacher only)
 * @param {string} teacherId - Teacher UUID
 * @param {string} schoolId - School UUID
 * @param {Object} tutorialData - Tutorial data
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function createTutorial(teacherId, schoolId, tutorialData) {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .insert({
        title: tutorialData.title,
        description: tutorialData.description,
        video_url: tutorialData.videoUrl,
        thumbnail_url: tutorialData.thumbnailUrl,
        category: tutorialData.category,
        target_audience: tutorialData.targetAudience,
        difficulty_level: tutorialData.difficultyLevel,
        duration_minutes: tutorialData.durationMinutes,
        created_by_teacher_id: teacherId,
        school_id: schoolId,
        is_preset: false,
        is_published: tutorialData.isPublished !== false, // Default true
        order_index: tutorialData.orderIndex || 999, // Put at end by default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Create tutorial error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Update a tutorial (teacher can only update their own)
 * @param {string} tutorialId - Tutorial UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function updateTutorial(tutorialId, updates) {
  try {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    // Map frontend field names to database column names
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
    if (updates.thumbnailUrl !== undefined)
      updateData.thumbnail_url = updates.thumbnailUrl;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.targetAudience !== undefined)
      updateData.target_audience = updates.targetAudience;
    if (updates.difficultyLevel !== undefined)
      updateData.difficulty_level = updates.difficultyLevel;
    if (updates.durationMinutes !== undefined)
      updateData.duration_minutes = updates.durationMinutes;
    if (updates.isPublished !== undefined)
      updateData.is_published = updates.isPublished;
    if (updates.orderIndex !== undefined)
      updateData.order_index = updates.orderIndex;

    const { data, error } = await supabase
      .from("tutorials")
      .update(updateData)
      .eq("id", tutorialId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Update tutorial error:", error);
    return { data: null, error: error.message };
  }
}

/**
 * Delete a tutorial (teacher can only delete their own)
 * @param {string} tutorialId - Tutorial UUID
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function deleteTutorial(tutorialId) {
  try {
    const { error } = await supabase
      .from("tutorials")
      .delete()
      .eq("id", tutorialId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete tutorial error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all tutorials created by a specific teacher
 * @param {string} teacherId - Teacher UUID
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function getTeacherTutorials(teacherId) {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("created_by_teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Get teacher tutorials error:", error);
    return { data: [], error: error.message };
  }
}

/**
 * Get all preset (platform) tutorials
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function getPresetTutorials() {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("is_preset", true)
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Get preset tutorials error:", error);
    return { data: [], error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse YouTube URL and extract video ID
 * Returns embed URL and thumbnail URL
 * @param {string} url - YouTube URL
 * @returns {Object|null} - { embedUrl, thumbnailUrl, videoId } or null
 */
export function parseYouTubeUrl(url) {
  // Support various YouTube URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID

  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );

  if (videoIdMatch) {
    const videoId = videoIdMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId,
    };
  }

  return null;
}

/**
 * Get category display name
 * @param {string} category - Category key
 * @returns {string} Display name
 */
export function getCategoryName(category) {
  const categoryNames = {
    "getting-started": "Getting Started",
    daw: "DAW-Lite",
    assignments: "Assignments",
    worlds: "3D Worlds",
    "teacher-tools": "Teacher Tools",
  };

  return categoryNames[category] || category;
}

/**
 * Get difficulty badge color
 * @param {string} difficulty - Difficulty level
 * @returns {string} Tailwind color classes
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return colors[difficulty] || "bg-gray-100 text-gray-600";
}

/**
 * Validate tutorial data before submission
 * @param {Object} tutorialData - Tutorial data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateTutorialData(tutorialData) {
  const errors = [];

  // Required fields
  if (!tutorialData.title || tutorialData.title.trim() === "") {
    errors.push("Title is required");
  }
  if (tutorialData.title && tutorialData.title.length > 255) {
    errors.push("Title must be less than 255 characters");
  }

  if (!tutorialData.videoUrl || tutorialData.videoUrl.trim() === "") {
    errors.push("Video URL is required");
  }

  // Validate YouTube URL if provided
  if (tutorialData.videoUrl && !parseYouTubeUrl(tutorialData.videoUrl)) {
    errors.push(
      "Invalid YouTube URL. Please provide a valid YouTube video link."
    );
  }

  if (!tutorialData.category) {
    errors.push("Category is required");
  }

  if (!tutorialData.targetAudience) {
    errors.push("Target audience is required");
  }

  if (!tutorialData.difficultyLevel) {
    errors.push("Difficulty level is required");
  }

  // Validate numeric fields
  if (
    tutorialData.durationMinutes &&
    (tutorialData.durationMinutes < 0 || tutorialData.durationMinutes > 999)
  ) {
    errors.push("Duration must be between 0 and 999 minutes");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
