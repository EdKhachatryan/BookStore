export interface AuthUser {
  username: string;
  displayName: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: AuthUser;
}

export interface LoginPayload {
  username: string;
  password: string;
}
