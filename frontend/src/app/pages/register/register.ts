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

  step: 'register' | 'verify' = 'register';

  fullName = '';
  email = '';
  phone = '';
  password = '';
  code = '';

  loading = false;
  error = '';
  success = '';

  resendSeconds = 0;
  private resendInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.error = '';
    this.success = '';

    const fullNameNormalizado = this.fullName.trim();
    const emailNormalizado = this.email.trim().toLowerCase();
    const phoneNormalizado = this.phone.trim();

    if (!fullNameNormalizado || !emailNormalizado || !phoneNormalizado || !this.password) {
      this.error = 'Completa todos los campos.';
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
        this.step = 'verify';

        this.success =
          resp?.message || 'Te enviamos un código a tu correo para activar tu cuenta.';

        this.startResendCountdown();
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error) {
          const errores = Object.values(err.error);
          this.error = errores.join(' - ');
        } else {
          this.error = 'No se pudo crear la cuenta.';
        }
      }
    });
  }

  verifyEmail(): void {
    this.error = '';
    this.success = '';

    const emailNormalizado = this.email.trim().toLowerCase();
    const codeNormalizado = this.code.trim();

    if (!emailNormalizado || !codeNormalizado) {
      this.error = 'Ingresa el código enviado a tu correo.';
      return;
    }

    if (codeNormalizado.length !== 6) {
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
        }, 1200);
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else {
  this.error = 'No se pudo verificar el correo. Intenta reenviar el código.';
}
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

        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'No se pudo reenviar el código.';
        }
      }
    });
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

  backToRegister(): void {
    this.step = 'register';
    this.code = '';
    this.error = '';
    this.success = '';
    clearInterval(this.resendInterval);
    this.resendSeconds = 0;
  }

  ngOnDestroy(): void {
    clearInterval(this.resendInterval);
  }
}