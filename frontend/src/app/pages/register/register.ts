import { Component } from '@angular/core';
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
export class RegisterComponent {

  fullName = '';
  email = '';
  phone = '';
  password = '';

  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.error = '';
    this.success = '';

    if (!this.fullName || !this.email || !this.phone || !this.password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    this.loading = true;

    const data = {
      fullName: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (user) => {
        this.loading = false;
        this.authService.saveUser(user);
        this.success = 'Cuenta creada correctamente.';
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;

        if (err.error) {
          const errores = Object.values(err.error);
          this.error = errores.join(' - ');
        } else {
          this.error = 'No se pudo crear la cuenta.';
        }
      }
    });
  }
}