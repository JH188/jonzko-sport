import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, AuthUser } from '../../../services/auth.service';
import { CustomerOrderService } from '../../../services/customer-order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  user = signal<AuthUser | null>(null);
  cart = signal<any[]>([]);

  tipoDocumento = 'Boleta';
  numeroDocumento = '';
  metodoPago = 'Yape';

  nombres = '';
  telefono = '';
  departamento = '';
  provincia = '';
  distrito = '';
  direccion = '';
  referencia = '';

  loading = false;
  error = '';

  paso: 'datos' | 'pago' = 'datos';

  numeroYape = '998989599';
  numeroPlin = '998989599';
  nombreTitular = 'Jonathan Huaman Lunazco';
  cuentaBcp = '19175917361000';

  constructor(
    private authService: AuthService,
    private router: Router,
    private customerOrderService: CustomerOrderService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.user.set(currentUser);
    this.nombres = currentUser.fullName;
    this.telefono = currentUser.phone;

    const savedCart = localStorage.getItem('jonzko_cart');
    this.cart.set(savedCart ? JSON.parse(savedCart) : []);

    if (this.cart().length === 0) {
      this.router.navigate(['/']);
    }
  }

  total(): number {
    return this.cart().reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }

  continuarPago(): void {
    this.error = '';

    const currentUser = this.user();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (
      !this.nombres ||
      !this.telefono ||
      !this.numeroDocumento ||
      !this.departamento ||
      !this.provincia ||
      !this.distrito ||
      !this.direccion
    ) {
      this.error = 'Completa todos los datos obligatorios para continuar.';
      return;
    }

    if (!/^9\d{8}$/.test(this.telefono)) {
      this.error = 'El celular debe tener 9 dígitos y empezar con 9.';
      return;
    }

    if (this.tipoDocumento === 'Boleta' && !/^\d{8}$/.test(this.numeroDocumento)) {
      this.error = 'Para boleta, el DNI debe tener 8 dígitos.';
      return;
    }

    if (this.tipoDocumento === 'Factura' && !/^\d{11}$/.test(this.numeroDocumento)) {
      this.error = 'Para factura, el RUC debe tener 11 dígitos.';
      return;
    }

    if (this.cart().length === 0) {
      this.error = 'Tu carrito está vacío.';
      return;
    }

    this.paso = 'pago';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmarPago(): void {
    this.error = '';

    const currentUser = this.user();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;

    const pedido = {
      userId: currentUser.id,
      customerName: this.nombres.trim(),
      customerEmail: currentUser.email,
      customerPhone: this.telefono.trim(),

      documentType: this.tipoDocumento,
      documentNumber: this.numeroDocumento.trim(),

      department: this.departamento.trim(),
      province: this.provincia.trim(),
      district: this.distrito.trim(),
      address: this.direccion.trim(),
      referenceText: this.referencia.trim(),

      paymentMethod: this.metodoPago,
      total: this.total(),
      itemsJson: JSON.stringify(this.cart())
    };

    this.customerOrderService.createOrder(pedido).subscribe({
      next: (response: any) => {
        this.loading = false;

        const mensaje = this.generarMensajeWhatsApp(response.orderId);
        const numeroWhatsApp = '51998989599';

        localStorage.removeItem('jonzko_cart');
        window.dispatchEvent(new Event('jonzko-cart-updated'));

        window.open(
          `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
          '_blank'
        );

        this.router.navigate(['/mis-pedidos']);
      },
      error: (err: any) => {
        this.loading = false;

        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'No se pudo registrar el pedido.';
        }
      }
    });
  }

  generarMensajeWhatsApp(orderId: number): string {
    const productos = this.cart()
      .map((item: any, index: number) => {
        return `${index + 1}. ${item.name}
Talla: ${item.selectedSize || 'No especificada'}
Color: ${item.color || 'No especificado'}
Cantidad: ${item.quantity}
Precio: S/ ${(item.price * item.quantity).toFixed(2)}`;
      })
      .join('\n\n');

    return `Hola, soy ${this.nombres}. Ya realicé mi pedido en JONZKO SPORT.

Código de pedido: #${orderId}

DATOS DEL CLIENTE:
Nombre: ${this.nombres}
Celular: ${this.telefono}
Correo: ${this.user()?.email}

COMPROBANTE:
Tipo: ${this.tipoDocumento}
Número: ${this.numeroDocumento}

ENVÍO:
Departamento: ${this.departamento}
Provincia: ${this.provincia}
Distrito: ${this.distrito}
Dirección: ${this.direccion}
Referencia: ${this.referencia || 'Sin referencia'}

PRODUCTOS:
${productos}

PAGO:
Método de pago: ${this.metodoPago}
Total: S/ ${this.total().toFixed(2)}

Envío el comprobante de pago.`;
  }
}