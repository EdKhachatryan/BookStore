export const RequestStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const;

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus];
