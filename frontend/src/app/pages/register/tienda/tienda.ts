import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService, Product } from '../../../services/api.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css'
})
export class TiendaComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando productos de tienda:', error);
        this.error.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  money(value: number | string | null | undefined): string {
    const amount = Number(value || 0);
    return `S/ ${amount.toFixed(2)}`;
  }

  discountPercent(product: Product): number {
    const oldPrice = Number(product.oldPrice || 0);
    const price = Number(product.price || 0);

    if (oldPrice <= 0 || price <= 0 || oldPrice <= price) {
      return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  cleanProductName(name: string): string {
    return (name || '').trim();
  }
}