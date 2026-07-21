export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';
export const Role = {
  ADMIN: 'ADMIN',
  LECTURER: 'LECTURER',
  STUDENT: 'STUDENT',
} as const;

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export const CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ResourceType = 'FILE' | 'LINK' | 'VIDEO';
export const ResourceType = {
  FILE: 'FILE',
  LINK: 'LINK',
  VIDEO: 'VIDEO',
} as const;

export type SubmissionStatus = 'SUBMITTED' | 'GRADED';
export const SubmissionStatus = {
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
} as const;

export type NotificationType = 'NEW_MESSAGE' | 'GRADE_PUBLISHED' | 'NEW_ANNOUNCEMENT';
export const NotificationType = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  GRADE_PUBLISHED: 'GRADE_PUBLISHED',
  NEW_ANNOUNCEMENT: 'NEW_ANNOUNCEMENT',
} as const;
