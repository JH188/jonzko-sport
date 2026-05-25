import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService, Product } from '../services/api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal('');

  selectedSize = signal('');
  quantity = signal(1);

  whatsappNumber = '51998989599';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('Producto no válido.');
      this.loading.set(false);
      return;
    }

    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el producto.');
        this.loading.set(false);
      }
    });
  }

  sizesList(): string[] {
    const product = this.product();

    if (!product?.sizes) {
      return [];
    }

    return product.sizes.split(',').map(size => size.trim());
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  increaseQty(): void {
    this.quantity.update(value => value + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(value => value - 1);
    }
  }
addToCart(): void {
  const product = this.product();

  if (!product) {
    return;
  }

  if (!this.selectedSize()) {
    alert('Selecciona una talla antes de agregar al carrito.');
    return;
  }

  const savedCart = localStorage.getItem('jonzko_cart');
  const cart = savedCart ? JSON.parse(savedCart) : [];

  const existingItemIndex = cart.findIndex((item: any) =>
    item.id === product.id &&
    item.selectedSize === this.selectedSize() &&
    item.selectedColor === product.color
  );

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += this.quantity();
  } else {
    const item = {
      ...product,
      quantity: this.quantity(),
      selectedSize: this.selectedSize(),
      selectedColor: product.color
    };

    cart.push(item);
  }

  localStorage.setItem('jonzko_cart', JSON.stringify(cart));

  window.dispatchEvent(new Event('jonzko-cart-updated'));
}

  buyWhatsapp(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    if (!this.selectedSize()) {
      alert('Selecciona una talla antes de comprar.');
      return;
    }

    const message = `
Hola, quiero hacer un pedido en JONZKO SPORT.

Producto: ${product.name}
Color: ${product.color || 'No especificado'}
Talla: ${this.selectedSize()}
Cantidad: ${this.quantity()}
Precio unitario: S/ ${Number(product.price).toFixed(2)}
Total: S/ ${(Number(product.price) * this.quantity()).toFixed(2)}

Método de pago: Yape / Plin / BCP

Mis datos:
Nombre:
Distrito:
Dirección:
Referencia:
    `.trim();

    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}