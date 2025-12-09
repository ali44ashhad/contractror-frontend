/**
 * Format role string to proper case
 * Converts "developer" -> "Developer", "contractor" -> "Contractor", etc.
 */
export const formatRole = (role: string | undefined | null): string => {
  if (!role) return '';
  
  // Capitalize first letter and lowercase the rest
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

