// types/auth.ts

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'superuser' | 'admin' | 'user'; // ✅ Fixed to match backend roles
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface FastAPIError {
  detail: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}