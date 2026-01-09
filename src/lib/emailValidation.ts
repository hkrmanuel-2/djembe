/**
 * Extract domain from email address
 * @param email - Email address (e.g., "user@school.edu")
 * @returns Domain part (e.g., "school.edu") or null if invalid
 */
export function extractDomain(email: string): string | null {
  if (!email || !email.includes("@")) {
    return null;
  }
  
  const parts = email.split("@");
  if (parts.length !== 2) {
    return null;
  }
  
  return parts[1].toLowerCase().trim();
}

/**
 * Validate if email domain matches any of the allowed domains for a school
 * @param email - Email address to validate
 * @param allowedDomains - Array of allowed domains (e.g., ["school.edu", "school.org"])
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateEmailDomain(
  email: string,
  allowedDomains: string[]
): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const domain = extractDomain(email);
  
  if (!domain) {
    return { isValid: false, error: "Invalid email format" };
  }

  if (!allowedDomains || allowedDomains.length === 0) {
    // If no domains are configured, allow any email (for flexibility)
    return { isValid: true };
  }

  // Check if domain matches any allowed domain (case-insensitive)
  const normalizedDomain = domain.toLowerCase();
  const normalizedAllowed = allowedDomains.map((d) => d.toLowerCase().trim());

  const isMatch = normalizedAllowed.some((allowed) => {
    // Exact match
    if (normalizedDomain === allowed) {
      return true;
    }
    // Subdomain match (e.g., "mail.school.edu" matches "school.edu")
    if (normalizedDomain.endsWith(`.${allowed}`)) {
      return true;
    }
    return false;
  });

  if (!isMatch) {
    return {
      isValid: false,
      error: `Email must be from one of these domains: ${allowedDomains.join(", ")}`,
    };
  }

  return { isValid: true };
}