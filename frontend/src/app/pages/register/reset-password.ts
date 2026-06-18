import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent {

  step: 'email' | 'reset' = 'email';

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  sendCode(): void {
    this.error = '';
    this.success = '';

    const emailNormalizado = this.email.trim().toLowerCase();

    if (!emailNormalizado) {
      this.error = 'Ingresa tu correo electrónico.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({
      email: emailNormalizado
    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.email = emailNormalizado;
        this.step = 'reset';
        this.success = resp.message || 'Código enviado. Revisa tu correo.';
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.email) {
          this.error = err.error.email;
        } else {
          this.error = 'No se pudo enviar el código. Intenta nuevamente.';
        }
      }
    });
  }

  resetPassword(): void {
    this.error = '';
    this.success = '';

    const emailNormalizado = this.email.trim().toLowerCase();
    const codeNormalizado = this.code.trim();

    if (!emailNormalizado || !codeNormalizado || !this.newPassword || !this.confirmPassword) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (codeNormalizado.length !== 6) {
      this.error = 'El código debe tener 6 dígitos.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      email: emailNormalizado,
      code: codeNormalizado,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.success = resp.message || 'Contraseña actualizada correctamente.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.code) {
          this.error = err.error.code;
        } else if (err.error?.newPassword) {
          this.error = err.error.newPassword;
        } else if (err.error?.confirmPassword) {
          this.error = err.error.confirmPassword;
        } else {
          this.error = 'No se pudo restablecer la contraseña.';
        }
      }
    });
  }

  backToEmail(): void {
    this.step = 'email';
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error = '';
    this.success = '';
  }
}