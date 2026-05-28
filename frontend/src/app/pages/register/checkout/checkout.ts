import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadMercadoPago } from '@mercadopago/sdk-js';

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
metodosPagoDisponibles = [
  {
    value: 'Yape',
    label: 'Yape',
    icon: 'assets/yape.png',
    description: 'Envía tu comprobante por WhatsApp'
  },
  {
    value: 'Plin',
    label: 'Plin',
    icon: 'assets/plin.png',
    description: 'Envía tu comprobante por WhatsApp'
  },
  {
    value: 'Transferencia BCP',
    label: 'Transferencia BCP',
    icon: 'assets/bcp.png',
    description: 'Envía tu comprobante por WhatsApp'
  }
];

  nombres = '';
  telefono = '';
  departamento = '';
  provincia = '';
  distrito = '';
  direccion = '';
  referencia = '';

  loading = false;
error = '';

apiUrl = 'https://jonzko-sport-production.up.railway.app';

mpPublicKey = 'APP_USR-b3bbb982-ec0b-41ca-a76b-03fb81edda58';
paymentBrickController: any = null;
yapePhone = '';
yapeOtp = '';


  paso: 'datos' | 'pago' | 'exito' = 'datos';
  pedidoRegistradoId: any = null;


  constructor(
  private authService: AuthService,
  private router: Router,
  private customerOrderService: CustomerOrderService,
  private http: HttpClient
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
async cargarPaymentBrick(): Promise<void> {
  try {
    await loadMercadoPago();

    const mp = new (window as any).MercadoPago(this.mpPublicKey, {
      locale: 'es-PE'
    });

    const bricksBuilder = mp.bricks();

    if (this.paymentBrickController) {
      await this.paymentBrickController.unmount();
    }

    const settings = {
      initialization: {
        amount: Number(this.total().toFixed(2)),
        payer: {
          email: this.user()?.email || ''
        }
      },
      customization: {
        visual: {
          style: {
            theme: 'default'
          }
        },
 paymentMethods: {
  creditCard: 'all',
  debitCard: 'all',
  maxInstallments: 1
}
      },
      callbacks: {
        onReady: () => {
          console.log('Payment Brick listo');
        },

        onSubmit: ({ selectedPaymentMethod, formData }: any) => {
          console.log('Método seleccionado:', selectedPaymentMethod);
          console.log('Datos del pago:', formData);

          this.loading = true;
          this.error = '';

          return new Promise((resolve, reject) => {
            this.http.post<any>(
              `${this.apiUrl}/api/payments/mercadopago/process-payment`,
              {
  ...formData,

  token: formData.token,
  transactionAmount: Number(this.total().toFixed(2)),
  amount: Number(this.total().toFixed(2)),
  installments: formData.installments,
  paymentMethodId: formData.payment_method_id || formData.paymentMethodId,
  issuerId: formData.issuer_id || formData.issuerId,
  payer: {
  email: formData.payer?.email || this.user()?.email || '',
  identification: {
    type: formData.payer?.identification?.type || 'DNI',
    number: formData.payer?.identification?.number || this.numeroDocumento
  }
},
  orderId: 'JONZKO-' + new Date().getTime(),
  description: 'Compra JONZKO SPORT',
  customerName: this.nombres,
  customerEmail: this.user()?.email,
  customerPhone: this.telefono,
  documentType: this.tipoDocumento,
  documentNumber: this.numeroDocumento,
  department: this.departamento,
  province: this.provincia,
  district: this.distrito,
  address: this.direccion,
  referenceText: this.referencia,
  itemsJson: JSON.stringify(this.cart())
}
            ).subscribe({
              next: (response) => {
                this.loading = false;
                console.log('Pago procesado:', response);
                resolve(response);

if (response.status === 'approved' || response.statusDetail === 'accredited') {

  const currentUser = this.user();

  if (!currentUser) {
    this.router.navigate(['/login']);
    return;
  }

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

    paymentMethod: 'Mercado Pago - Pagado',
    total: this.total(),
    itemsJson: JSON.stringify(this.cart())
  };

 this.customerOrderService.createOrder(pedido).subscribe({
    next: (orderResponse: any) => {
      this.loading = false;

      this.pedidoRegistradoId = orderResponse?.id || orderResponse?.orderId || null;

      localStorage.removeItem('jonzko_cart');
      window.dispatchEvent(new Event('jonzko-cart-updated'));

      localStorage.setItem('jonzko_pago_exitoso', 'true');

      this.paso = 'exito';

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    error: (err) => {
      console.error('El pago fue aprobado, pero no se registró el pedido:', err);
      this.error = 'El pago fue aprobado, pero hubo un problema registrando el pedido.';
    }
  });

}
              },
              error: (error) => {
                this.loading = false;
                console.error('Error procesando pago:', error);
                this.error = 'No se pudo procesar el pago con Mercado Pago.';
                reject(error);
              }
            });
          });
        },

        onError: (error: any) => {
          console.error('Error Payment Brick:', error);
          this.error = 'Ocurrió un error cargando Mercado Pago.';
        }
      }
    };

    this.paymentBrickController = await bricksBuilder.create(
      'payment',
      'paymentBrick_container',
      settings
    );

  } catch (error) {
    console.error('Error cargando Mercado Pago Brick:', error);
    this.error = 'No se pudo cargar el formulario de Mercado Pago.';
  }
}
volverDatos(): void {
  this.paso = 'datos';

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}
irAMisPedidos(): void {
  this.router.navigate(['/mis-pedidos']);
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
paymentStatus: 'Pago por validar',
orderStatus: 'Pendiente',
total: this.total(),
itemsJson: JSON.stringify(this.cart())
    };

    this.customerOrderService.createOrder(pedido).subscribe({
      next: (response: any) => {
        this.loading = false;

        const mensaje = this.generarMensajeWhatsAppYape();
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
pagarConMercadoPago(): void {
  this.error = '';

  const currentUser = this.user();

  if (!currentUser) {
    this.router.navigate(['/login']);
    return;
  }

  if (this.cart().length === 0) {
    this.error = 'Tu carrito está vacío.';
    return;
  }

  this.loading = true;

  const primerProducto = this.cart()[0];

  const body = {
    orderId: 'JONZKO-' + new Date().getTime(),
    title: this.cart().length === 1
      ? primerProducto.name
      : `Pedido JONZKO (${this.cart().length} productos)`,
    description: 'Compra realizada en JONZKO',
    quantity: 1,
    unitPrice: Number(this.total().toFixed(2))
  };

  this.http.post<any>(
    `${this.apiUrl}/api/payments/mercadopago/create-preference`,
    body
  ).subscribe({
    next: (response) => {
      this.loading = false;

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        this.error = 'Mercado Pago no devolvió el enlace de pago.';
      }
    },
    error: (err) => {
      this.loading = false;
      console.error('Error Mercado Pago:', err);
      this.error = err.error?.detail || err.error?.error || 'No se pudo iniciar el pago con Mercado Pago.';
    }
  });
}
confirmarYapeManual(): void {
  this.error = '';

  const currentUser = this.user();

  if (!currentUser) {
    this.router.navigate(['/login']);
    return;
  }

  if (this.cart().length === 0) {
    this.error = 'Tu carrito está vacío.';
    return;
  }

  this.loading = true;
  this.metodoPago = this.metodoPago || 'Yape';

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
paymentStatus: 'Pago por validar',
orderStatus: 'Pendiente',
total: this.total(),
itemsJson: JSON.stringify(this.cart())
  };

  this.customerOrderService.createOrder(pedido).subscribe({
    next: () => {
      this.loading = false;

      const mensaje = this.generarMensajeWhatsAppYape();
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
      console.error('Error registrando pedido manual:', err);

      if (err.error?.message) {
        this.error = err.error.message;
      } else {
        this.error = 'No se pudo registrar el pedido. Inténtalo nuevamente.';
      }
    }
  });
}
generarMensajeWhatsAppYape(): string {
  const productosTexto = this.cart()
    .map((item, index) => {
      return `${index + 1}. ${item.name}
Talla: ${item.selectedSize || 'No especificada'}
Color: ${item.color || 'No especificado'}
Cantidad: ${item.quantity}
Precio: S/ ${(item.price * item.quantity).toFixed(2)}`;
    })
    .join('\n\n');

  return `Hola, soy ${this.nombres}. Acabo de realizar un pedido en JONZKO SPORT.

DATOS DEL CLIENTE:
Nombre: ${this.nombres}
Celular: ${this.telefono}
Correo: ${this.user()?.email || ''}

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
${productosTexto}

PAGO:
Método de pago: ${this.metodoPago}
Estado: Pago por validar
Total a validar: S/ ${this.total().toFixed(2)}

Adjunto mi comprobante para validar mi pedido.`;
}
}