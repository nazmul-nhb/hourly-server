/** User Roles */
export const USER_ROLES = ['super_admin', 'admin', 'user'] as const;

/**Admin Roles */
export const ADMIN_ROLES = USER_ROLES.filter((role) => role !== 'user');

/** Collection Names */
export const COLLECTIONS = ['N/A', 'User', 'Shift'] as const;
