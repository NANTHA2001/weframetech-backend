export type Role = 'attendee' | 'organizer' | 'admin';

export const hasRole = (user: any, roles: Role[]) =>
  user && roles.includes(user.role);

export const isAttendee = (user: any) => hasRole(user, ['attendee']);
export const isOrganizer = (user: any) => hasRole(user, ['organizer']);
export const isAdmin = (user: any) => hasRole(user, ['admin']);
