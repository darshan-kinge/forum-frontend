/**
 * Check if user has permission to view a page
 * @param {Object} user - User object from auth context
 * @param {string} pageName - Page identifier (e.g., 'members', 'blog', 'recruitment')
 * @returns {boolean}
 */
export const canView = (user, pageName) => {
  // Super admins (isAdmin without permissions object) have full access
  if (user?.isAdmin && (!user?.permissions || Object.keys(user.permissions).length === 0)) {
    return true;
  }

  // Check if user has view permission for the page
  if (user?.permissions?.[pageName]?.view) {
    return true;
  }

  return false;
};

/**
 * Check if user has any permission for a page (view only now)
 * @param {Object} user - User object from auth context
 * @param {string} pageName - Page identifier
 * @returns {boolean}
 */
export const hasAccess = (user, pageName) => {
  return canView(user, pageName);
};

