import { describe, it, expect } from 'vitest';
import {
  hasRole,
  canManageAccounts,
  canManageContent,
} from '@/lib/auth/roles';

describe('hasRole', () => {
  it('admin đạt quyền admin', () => {
    expect(hasRole({ role: 'admin' }, 'admin')).toBe(true);
  });

  it('editor không đạt quyền admin', () => {
    expect(hasRole({ role: 'editor' }, 'admin')).toBe(false);
  });

  it('editor đạt quyền editor', () => {
    expect(hasRole({ role: 'editor' }, 'editor')).toBe(true);
  });

  it('admin đạt cả quyền editor (admin > editor)', () => {
    expect(hasRole({ role: 'admin' }, 'editor')).toBe(true);
  });

  it('profile null luôn thất bại', () => {
    expect(hasRole(null, 'editor')).toBe(false);
  });
});

describe('canManageAccounts', () => {
  it('chỉ admin được quản lý tài khoản', () => {
    expect(canManageAccounts({ role: 'admin' })).toBe(true);
    expect(canManageAccounts({ role: 'editor' })).toBe(false);
  });
});

describe('canManageContent', () => {
  it('editor trở lên được quản lý nội dung', () => {
    expect(canManageContent({ role: 'editor' })).toBe(true);
    expect(canManageContent({ role: 'admin' })).toBe(true);
    expect(canManageContent(null)).toBe(false);
  });
});
