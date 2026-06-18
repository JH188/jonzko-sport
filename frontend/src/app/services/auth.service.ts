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

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationCodeRequest {
  email: string;
}

export interface AuthMessageResponse {
  message: string;
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

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  emailVerified?: boolean;
  message?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authApiUrl = 'https://jonzko-sport-production.up.railway.app/api/auth';

  private storageKey = 'jonzko_user';
  private tokenKey = 'jonzko_user_token';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.authApiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.authApiUrl}/login`, data);
  }

  verifyEmail(data: VerifyEmailRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.authApiUrl}/verify-email`, data);
  }

  resendVerificationCode(data: ResendVerificationCodeRequest): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(
      `${this.authApiUrl}/resend-verification-code`,
      data
    );
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