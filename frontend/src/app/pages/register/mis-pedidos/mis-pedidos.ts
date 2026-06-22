import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService, AuthUser } from '../../../services/auth.service';
import { CustomerOrderService } from '../../../services/customer-order.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss'
})
export class MisPedidosComponent implements OnInit {
  user = signal<AuthUser | null>(null);

  searchText = '';
  selectedFilter = 'todos';

  pedidos: any[] = [];

  loading = false;
  error = '';
  selectedPedido: any = null;

  constructor(
    private authService: AuthService,
    private customerOrderService: CustomerOrderService
  ) {}

  ngOnInit(): void {
    const currentUser: any = this.authService.getUser();
    this.user.set(currentUser);

    console.log('USUARIO ACTUAL MIS PEDIDOS:', currentUser);

    const userId = Number(
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.user_id
    );

    if (!userId) {
      this.error = 'No se encontró el usuario. Cierra sesión e inicia sesión nuevamente.';
      return;
    }

    this.loadPedidos(userId);
  }

  loadPedidos(userId: number): void {
    this.loading = true;
    this.error = '';

    this.customerOrderService.getOrdersByUser(userId).subscribe({
      next: (data: any[]) => {
        this.loading = false;

        console.log('PEDIDOS RECIBIDOS:', data);

        this.pedidos = (data || [])
          .map((pedido: any) => this.normalizarPedido(pedido))
          .sort((a: any, b: any) => {
            const fechaA = new Date(a.createdAt || 0).getTime();
            const fechaB = new Date(b.createdAt || 0).getTime();
            return fechaB - fechaA;
          });
      },
      error: (err) => {
        this.loading = false;
        console.error('ERROR CARGANDO MIS PEDIDOS:', err);
        this.error = 'No se pudieron cargar tus pedidos.';
      }
    });
  }

  normalizarPedido(pedido: any): any {
    const itemsRaw =
      pedido.itemsJson ||
      pedido.items_json ||
      pedido.productos ||
      pedido.items ||
      '[]';

    let productos: any[] = [];

    try {
      if (Array.isArray(itemsRaw)) {
        productos = itemsRaw;
      } else {
        productos = JSON.parse(itemsRaw || '[]');
      }
    } catch (e) {
      console.error('ERROR PARSEANDO PRODUCTOS DEL PEDIDO:', pedido, e);
      productos = [];
    }

    productos = productos.map((item: any, index: number) => {
      const price = Number(item.price || item.unitPrice || item.precio || 0);
      const quantity = Number(item.quantity || item.cantidad || 1);

      return {
        id: item.id || item.productId || item.product_id || index + 1,
        name: item.name || item.productName || item.product_name || 'Producto JONZKO',
        imageUrl:
          item.imageUrl ||
          item.image_url ||
          item.image ||
          item.imagen ||
          'assets/logo.jpg',
        selectedSize:
          item.selectedSize ||
          item.size ||
          item.talla ||
          item.selected_size ||
          'No especificada',
        color:
          item.color ||
          item.colour ||
          item.selectedColor ||
          item.selected_color ||
          'No especificado',
        quantity,
        price
      };
    });

    return {
      ...pedido,

      id: pedido.id,
      userId: pedido.userId || pedido.user_id,

      createdAt: pedido.createdAt || pedido.created_at || pedido.updatedAt || pedido.updated_at,

      customerName: pedido.customerName || pedido.customer_name || '',
      customerEmail: pedido.customerEmail || pedido.customer_email || '',
      customerPhone: pedido.customerPhone || pedido.customer_phone || '',

      documentType: pedido.documentType || pedido.document_type || 'Boleta',
      documentNumber: pedido.documentNumber || pedido.document_number || '',

      department: pedido.department || '',
      province: pedido.province || '',
      district: pedido.district || '',
      address: pedido.address || '',
      referenceText: pedido.referenceText || pedido.reference_text || '',

      paymentMethod: pedido.paymentMethod || pedido.payment_method || '',
      paymentStatus: pedido.paymentStatus || pedido.payment_status || '',
      orderStatus: pedido.orderStatus || pedido.order_status || '',

      total: Number(pedido.total || 0).toFixed(2),

      productos
    };
  }

  openDetalle(pedido: any): void {
    this.selectedPedido = pedido;
  }

  closeDetalle(): void {
    this.selectedPedido = null;
  }

  filteredPedidos(): any[] {
    return this.pedidos.filter((pedido) => {
      const texto = this.searchText.toLowerCase().trim();

      const codigo = String(pedido.id || '').toLowerCase();
      const estado = String(pedido.paymentStatus || pedido.orderStatus || '').toLowerCase();
      const fecha = String(pedido.createdAt || '').toLowerCase();
      const metodo = String(pedido.paymentMethod || '').toLowerCase();

      const matchText =
        !texto ||
        codigo.includes(texto) ||
        estado.includes(texto) ||
        fecha.includes(texto) ||
        metodo.includes(texto);

      if (this.selectedFilter === 'todos') {
        return matchText;
      }

      const estadoPedido = String(pedido.paymentStatus || pedido.orderStatus || '').toLowerCase();
      const filtro = String(this.selectedFilter || '').toLowerCase();

      return estadoPedido === filtro && matchText;
    });
  }

  getStatusClass(status: string): string {
    const estado = String(status || '').toLowerCase();

    if (estado === 'pagado') return 'status-confirmed';
    if (estado === 'pago aprobado') return 'status-confirmed';
    if (estado === 'confirmado') return 'status-confirmed';
    if (estado === 'entregado') return 'status-delivered';
    if (estado === 'enviado') return 'status-sent';
    if (estado === 'pendiente') return 'status-pending';
    if (estado === 'cancelado') return 'status-cancelled';
    if (estado === 'rechazado') return 'status-cancelled';

    return 'status-pending';
  }

  getStatusText(pedido: any): string {
    const estado = pedido.paymentStatus || pedido.orderStatus || 'Pendiente';
    const estadoLower = String(estado).toLowerCase();

    if (estadoLower === 'pagado') return 'Pagado';
    if (estadoLower === 'pago aprobado') return 'Pagado';
    if (estadoLower === 'confirmado') return 'Confirmado';
    if (estadoLower === 'pendiente') return 'Pendiente';
    if (estadoLower === 'enviado') return 'Enviado';
    if (estadoLower === 'entregado') return 'Entregado';
    if (estadoLower === 'cancelado') return 'Cancelado';
    if (estadoLower === 'rechazado') return 'Rechazado';

    return estado;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);

    if (isNaN(date.getTime())) {
      return 'Sin fecha';
    }

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  subtotal(item: any): string {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    return (price * quantity).toFixed(2);
  }
}