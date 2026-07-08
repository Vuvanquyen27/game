import type { UserRole } from '@/lib/constants';

/** Kiểu profile tối thiểu để kiểm tra quyền (thuần, không phụ thuộc server). */
export interface RoleBearer {
  role: UserRole;
}

/** admin > editor. Kiểm tra profile có đạt quyền yêu cầu không. */
export function hasRole(
  profile: RoleBearer | null | undefined,
  required: UserRole,
): boolean {
  if (!profile) return false;
  if (required === 'editor') {
    return profile.role === 'admin' || profile.role === 'editor';
  }
  return profile.role === 'admin';
}

/** Chỉ admin được quản lý tài khoản/cấu hình hệ thống. */
export function canManageAccounts(profile: RoleBearer | null | undefined) {
  return hasRole(profile, 'admin');
}

/** Editor trở lên được quản lý sản phẩm & nội dung social. */
export function canManageContent(profile: RoleBearer | null | undefined) {
  return hasRole(profile, 'editor');
}
