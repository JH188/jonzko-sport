import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface AdminLoginStepResponse {
  message: string;
  requiresCode: boolean;
  email: string;
}

interface AdminLoginResponse {
  token: string;
  role: string;
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  code: string = '';

  loading: boolean = false;
  codeStep: boolean = false;
  codeSentEmail: string = '';

  message: string = '';
  errorMessage: string = '';

  private readonly apiUrl = 'https://jonzko-sport-production.up.railway.app/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  loginAdmin(): void {
    const email = this.email.trim();
    const password = this.password.trim();

    this.message = '';
    this.errorMessage = '';

    if (!email || !password) {
      this.errorMessage = 'Ingresa el correo y contraseña del administrador.';
      return;
    }

    this.loading = true;

    this.http.post<AdminLoginStepResponse>(`${this.apiUrl}/auth/admin-login`, {
      email,
      password
    }).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.requiresCode) {
          this.codeStep = true;
          this.codeSentEmail = response.email || email;
          this.message = response.message || 'Código enviado al correo administrador.';
          return;
        }

        this.errorMessage = 'Respuesta inesperada del servidor.';
      },
      error: (error) => {
        this.loading = false;
        console.error('Error admin-login:', error);
        this.errorMessage = 'Credenciales incorrectas o acceso no autorizado.';
      }
    });
  }

  verifyCode(): void {
    const email = (this.codeSentEmail || this.email).trim();
    const code = this.code.trim();

    this.message = '';
    this.errorMessage = '';

    if (!email || !code) {
      this.errorMessage = 'Ingresa el código de seguridad.';
      return;
    }

    if (code.length < 6) {
      this.errorMessage = 'El código debe tener 6 dígitos.';
      return;
    }

    this.loading = true;

    this.http.post<AdminLoginResponse>(`${this.apiUrl}/auth/admin-login/verify-code`, {
      email,
      code
    }).subscribe({
      next: (response) => {
        if (response.role !== 'ADMIN') {
          this.loading = false;
          this.errorMessage = 'No tienes permisos de administrador.';
          return;
        }

        localStorage.setItem('jonzko_admin_token', response.token);
        localStorage.setItem('jonzko_admin_role', response.role);
        localStorage.setItem('jonzko_admin_name', response.fullName);
        localStorage.setItem('jonzko_admin_email', response.email);
        localStorage.setItem('jonzko_admin_logged', 'true');

        this.loading = false;
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error verificando código admin:', error);
        this.errorMessage = 'Código incorrecto o vencido. Solicita uno nuevo.';
      }
    });
  }

  resendCode(): void {
    this.code = '';
    this.codeStep = false;
    this.loginAdmin();
  }

  backToCredentials(): void {
    this.codeStep = false;
    this.code = '';
    this.message = '';
    this.errorMessage = '';
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }
}