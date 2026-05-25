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

openDetalle(pedido: any): void {
  this.selectedPedido = pedido;
}

closeDetalle(): void {
  this.selectedPedido = null;
}

  constructor(
    private authService: AuthService,
    private customerOrderService: CustomerOrderService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.user.set(currentUser);

    if (currentUser?.id) {
      this.loadPedidos(currentUser.id);
    }
  }

  loadPedidos(userId: number): void {
    this.loading = true;
    this.error = '';

    this.customerOrderService.getOrdersByUser(userId).subscribe({
      next: (data: any[]) => {
        this.loading = false;

        this.pedidos = data.map((pedido) => {
          let productos: any[] = [];

          try {
            productos = pedido.itemsJson ? JSON.parse(pedido.itemsJson) : [];
          } catch {
            productos = [];
          }

          return {
            ...pedido,
            productos
          };
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar tus pedidos.';
      }
    });
  }

  filteredPedidos(): any[] {
    return this.pedidos.filter((pedido) => {
      const texto = this.searchText.toLowerCase();

      const codigo = String(pedido.id || '').toLowerCase();
      const estado = String(pedido.orderStatus || '').toLowerCase();
      const fecha = String(pedido.createdAt || '').toLowerCase();
      const metodo = String(pedido.paymentMethod || '').toLowerCase();

      const matchText =
        codigo.includes(texto) ||
        estado.includes(texto) ||
        fecha.includes(texto) ||
        metodo.includes(texto);

      if (this.selectedFilter === 'todos') {
        return matchText || !texto;
      }

      return pedido.orderStatus === this.selectedFilter && (matchText || !texto);
    });
  }

  getStatusClass(status: string): string {
    const estado = (status || '').toLowerCase();

    if (estado === 'pendiente') return 'status-pending';
    if (estado === 'confirmado') return 'status-confirmed';
    if (estado === 'enviado') return 'status-sent';
    if (estado === 'entregado') return 'status-delivered';
    if (estado === 'cancelado') return 'status-cancelled';

    return 'status-pending';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}