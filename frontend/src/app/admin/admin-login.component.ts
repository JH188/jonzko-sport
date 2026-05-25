import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  loginAdmin(): void {
    if (!this.email.trim() || !this.password.trim()) {
      alert('Ingresa el correo y contraseña del administrador.');
      return;
    }

    if (
      this.email.trim() === 'admin@jonzko.com' &&
      this.password.trim() === 'admin123'
    ) {
      localStorage.setItem('jonzko_admin_logged', 'true');
      this.router.navigate(['/admin']);
      return;
    }

    alert('Credenciales incorrectas.');
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }
}