
import { EmployeeProfile, UserRole } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

const EMP_STORAGE_KEY = 'aligna_employees_db';
const AUDIT_LOG_KEY = 'aligna_audit_logs';

/**
 * Enterprise Profile Service
 * Handles mock backend logic for role-based validation and persistence.
 */
export const profileService = {
  // Initialize DB with seed data if empty
  getEmployees(): EmployeeProfile[] {
    const data = localStorage.getItem(EMP_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(MOCK_EMPLOYEES));
      return MOCK_EMPLOYEES;
    }
    return JSON.parse(data);
  },

  getAuditLogs() {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  },

  /**
   * PATCH /api/employees/{employeeId}
   * Enforces role-based field restrictions.
   */
  async updateProfile(
    actor: { id: string; role: UserRole },
    targetEmployeeId: string,
    updates: Partial<EmployeeProfile>
  ): Promise<{ status: 'success' | 'error'; message: string; updatedProfile?: EmployeeProfile }> {
    try {
      const db = this.getEmployees();
      const empIdx = db.findIndex(e => e.id === targetEmployeeId || e.employeeId === targetEmployeeId);
      
      if (empIdx === -1) {
        return { status: 'error', message: 'Employee not found.' };
      }

      const original = { ...db[empIdx] };
      const isSelf = actor.id === original.id;
      const isAdmin = actor.role === UserRole.ADMIN;

      // Restricted fields that only ADMIN can change
      const restrictedFields: (keyof EmployeeProfile)[] = [
        'fullName', 'email', 'role', 'department', 'position', 
        'salary', 'employeeId', 'joinDate'
      ];

      // 1. Validate permissions
      if (!isAdmin) {
        // Employee role checking
        const modifiedRestrictedFields = restrictedFields.filter(
          field => updates[field] !== undefined && updates[field] !== original[field]
        );

        if (modifiedRestrictedFields.length > 0) {
          return {
            status: 'error',
            message: 'You do not have permission to edit restricted fields.'
          };
        }
      }

      // 2. Identify changed fields for audit log
      const changedFields: any = {};
      const finalUpdates: any = {};

      // Only apply fields allowed for the user's role
      const allowedFields = isAdmin 
        ? Object.keys(updates) 
        : ['phone', 'address', 'avatar'];

      allowedFields.forEach((key) => {
        const fieldKey = key as keyof EmployeeProfile;
        if (updates[fieldKey] !== undefined && updates[fieldKey] !== original[fieldKey]) {
          changedFields[fieldKey] = { old: original[fieldKey], new: updates[fieldKey] };
          finalUpdates[fieldKey] = updates[fieldKey];
        }
      });

      if (Object.keys(finalUpdates).length === 0) {
        return { status: 'success', message: 'No changes detected.', updatedProfile: original };
      }

      // 3. Persist changes
      const updatedProfile = { 
        ...original, 
        ...finalUpdates,
        updatedAt: new Date().toISOString(),
        updatedBy: actor.id
      };
      
      db[empIdx] = updatedProfile;
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(db));

      // 4. Create Audit Log
      const logs = this.getAuditLogs();
      logs.push({
        id: `log_${Date.now()}`,
        employeeId: original.employeeId,
        changedFields,
        updatedBy: actor.id,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));

      // Trigger global event for sync
      window.dispatchEvent(new Event('profile_updated'));

      return {
        status: 'success',
        message: 'Profile updated successfully',
        updatedProfile
      };
    } catch (err) {
      return {
        status: 'error',
        message: 'Unable to save changes. Please try again.'
      };
    }
  }
};
