import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  loading: boolean = false;

  private readonly apiUrl = 'https://jonzko-sport-production.up.railway.app/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  loginAdmin(): void {
    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      alert('Ingresa el correo y contraseña del administrador.');
      return;
    }

    this.loading = true;

    this.http.post<AdminLoginResponse>(`${this.apiUrl}/auth/admin-login`, {
      email,
      password
    }).subscribe({
      next: (response) => {
        if (response.role !== 'ADMIN') {
          alert('No tienes permisos de administrador.');
          this.loading = false;
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
      error: () => {
        this.loading = false;
        alert('Credenciales incorrectas o acceso no autorizado.');
      }
    });
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }
}