export enum UserRole {
  ADMIN = 'ADMIN',
  CENTER_MANAGER = 'CENTER_MANAGER',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export const USER_ROLE_VALUES = Object.values(UserRole);

export function isUserRole(value: string): value is UserRole {
  return USER_ROLE_VALUES.includes(value as UserRole);
}
