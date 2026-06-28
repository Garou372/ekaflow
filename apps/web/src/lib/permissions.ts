/**
 * Permissions Helper
 * 
 * Centralized Role-Based Access Control (RBAC) foundation.
 * Currently supports a single freelancer role, but provides the structure
 * for future team features (e.g., 'admin', 'editor', 'viewer').
 */

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface UserContext {
  id: string;
  role: UserRole;
}

export const PERMISSIONS = {
  INVOICES: {
    CREATE: ["owner", "admin", "member"],
    READ: ["owner", "admin", "member", "viewer"],
    UPDATE: ["owner", "admin", "member"],
    DELETE: ["owner", "admin"],
  },
  PROPOSALS: {
    CREATE: ["owner", "admin", "member"],
    READ: ["owner", "admin", "member", "viewer"],
    UPDATE: ["owner", "admin", "member"],
    DELETE: ["owner", "admin"],
  },
  SETTINGS: {
    MANAGE: ["owner", "admin"],
  }
};

export function hasPermission(user: UserContext, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role);
}

// Example usage wrappers
export function canDeleteInvoice(user: UserContext) {
  return hasPermission(user, PERMISSIONS.INVOICES.DELETE as UserRole[]);
}

export function canManageSettings(user: UserContext) {
  return hasPermission(user, PERMISSIONS.SETTINGS.MANAGE as UserRole[]);
}
