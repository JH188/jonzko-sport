import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  message?: string;

  // JWT del usuario normal
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://jonzko-sport-production.up.railway.app/api/users';
  private authApiUrl = 'https://jonzko-sport-production.up.railway.app/api/auth';

  private storageKey = 'jonzko_user';
  private tokenKey = 'jonzko_user_token';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.authApiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.authApiUrl}/reset-password`, data);
  }

  saveUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));

    if (user.token) {
      localStorage.setItem(this.tokenKey, user.token);
    }
  }

  getUser(): AuthUser | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
  }
}