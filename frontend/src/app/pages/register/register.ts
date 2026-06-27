import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent implements OnDestroy {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  code = '';

  loading = false;
  error = '';
  success = '';

  codeSent = false;
  resendSeconds = 0;
  private resendInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  sendVerificationCode(): void {
    this.error = '';
    this.success = '';

    const fullNameNormalizado = this.fullName.trim();
    const emailNormalizado = this.email.trim().toLowerCase();
    const phoneNormalizado = this.phone.trim();

    if (!fullNameNormalizado || !emailNormalizado || !phoneNormalizado || !this.password) {
      this.error = 'Completa todos los campos antes de verificar tu correo.';
      return;
    }

    if (!this.isValidEmail(emailNormalizado)) {
      this.error = 'Ingresa un correo válido.';
      return;
    }

    if (!/^9\d{8}$/.test(phoneNormalizado)) {
      this.error = 'El celular debe tener 9 dígitos y empezar con 9.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres.';
      return;
    }

    this.loading = true;

    const data = {
      fullName: fullNameNormalizado,
      email: emailNormalizado,
      phone: phoneNormalizado,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (resp: any) => {
        this.loading = false;

        this.email = emailNormalizado;
        this.codeSent = true;
        this.code = '';

        this.success =
          resp?.message || 'Te enviamos un código a tu correo. Escríbelo para terminar tu registro.';

        this.startResendCountdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = this.getErrorMessage(err, 'No se pudo enviar el código.');
      }
    });
  }

  completeRegister(): void {
    this.error = '';
    this.success = '';

    const emailNormalizado = this.email.trim().toLowerCase();
    const codeNormalizado = this.code.trim();

    if (!this.codeSent) {
      this.error = 'Primero verifica tu correo.';
      return;
    }

    if (!codeNormalizado) {
      this.error = 'Ingresa el código enviado a tu correo.';
      return;
    }

    if (!/^\d{6}$/.test(codeNormalizado)) {
      this.error = 'El código debe tener 6 dígitos.';
      return;
    }

    this.loading = true;

    this.authService.verifyEmail({
      email: emailNormalizado,
      code: codeNormalizado
    }).subscribe({
      next: (user: any) => {
        this.loading = false;

        this.authService.saveUser(user);
        this.success = user?.message || 'Cuenta verificada correctamente.';

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 900);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.getErrorMessage(
          err,
          'Código incorrecto o expirado. Revisa tu correo e intenta nuevamente.'
        );
      }
    });
  }

  resendCode(): void {
    this.error = '';
    this.success = '';

    if (this.resendSeconds > 0 || this.loading) {
      return;
    }

    const emailNormalizado = this.email.trim().toLowerCase();

    if (!emailNormalizado) {
      this.error = 'No se encontró el correo.';
      return;
    }

    this.loading = true;

    this.authService.resendVerificationCode({
      email: emailNormalizado
    }).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.success = resp?.message || 'Nuevo código enviado. Revisa tu correo.';
        this.startResendCountdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = this.getErrorMessage(err, 'No se pudo reenviar el código.');
      }
    });
  }

  changeData(): void {
    this.codeSent = false;
    this.code = '';
    this.error = '';
    this.success = '';
    this.resendSeconds = 0;
    clearInterval(this.resendInterval);
  }

  startResendCountdown(): void {
    clearInterval(this.resendInterval);

    this.resendSeconds = 30;

    this.resendInterval = setInterval(() => {
      this.resendSeconds--;

      if (this.resendSeconds <= 0) {
        clearInterval(this.resendInterval);
        this.resendSeconds = 0;
      }
    }, 1000);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private getErrorMessage(err: any, defaultMessage: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.error && typeof err.error === 'object') {
      const errores = Object.values(err.error);
      return errores.join(' - ');
    }

    return defaultMessage;
  }

  ngOnDestroy(): void {
    clearInterval(this.resendInterval);
  }
}