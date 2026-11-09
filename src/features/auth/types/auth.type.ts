export interface AuthUser {
  id: string;
  customerId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
}

export interface LogoutResponse {
  loggedOut: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  initialize: () => Promise<void>;
  isLoading: boolean;
  isLoggingIn: boolean;
}
