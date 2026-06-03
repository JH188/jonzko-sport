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

  productMedia = signal<{ type: 'image' | 'video'; src: string }[]>([]);
  activeMediaIndex = signal(0);

  sizeGuideOpen = signal(false);
  relatedProducts = signal<Product[]>([]);

  whatsappNumber = '51998989599';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));

    if (!id) {
      this.error.set('Producto no válido.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.selectedSize.set('');
    this.quantity.set(1);
    this.activeMediaIndex.set(0);

    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loadProductMedia(product);
        this.loadRelatedProducts(product.id);
        this.loading.set(false);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el producto.');
        this.loading.set(false);
      },
    });
  });
}

  loadProductMedia(product: Product): void {
    const name = (product.name || '').toLowerCase();

    let media: { type: 'image' | 'video'; src: string }[] = [];

    if (name.includes('blanca')) {
      media = [
        { type: 'image', src: 'assets/polera-blanca.jpeg' },
        { type: 'image', src: 'assets/polera-blanca-2.jpeg' },
        { type: 'image', src: 'assets/polera-blanca-3.jpeg' },
        { type: 'video', src: 'assets/polera-blanca-video.mp4' },
      ];
    } else if (name.includes('morada')) {
      media = [
        { type: 'image', src: 'assets/polera-morada-1.jpeg' },
        { type: 'image', src: 'assets/polera-morada-2.jpeg' },
        { type: 'image', src: 'assets/polera-morada-3.jpeg' },
        { type: 'video', src: 'assets/polera-morada-video.mp4' },
      ];
    } else if (name.includes('plomo') || name.includes('oscuro')) {
      media = [
        { type: 'image', src: 'assets/polera-plomo-1.jpeg' },
        { type: 'image', src: 'assets/polera-plomo-2.jpeg' },
        { type: 'image', src: 'assets/polera-plomo-3.jpeg' },
        { type: 'video', src: 'assets/polera-plomo-video.mp4' },
      ];
    } else if (name.includes('negra') && name.includes('polera')) {
      media = [
        { type: 'image', src: 'assets/polera-negra-1.jpeg' },
        { type: 'image', src: 'assets/polera-negra-2.jpeg' },
        { type: 'image', src: 'assets/polera-negra-3.jpeg' },
        { type: 'video', src: 'assets/polera-negra-video.mp4' },
      ];
    } else if (name.includes('verde')) {
      media = [
        { type: 'image', src: 'assets/polera-verde-1.jpeg' },
        { type: 'image', src: 'assets/polera-verde-2.jpeg' },
        { type: 'image', src: 'assets/polera-verde-3.jpeg' },
        { type: 'video', src: 'assets/polera-verde-video.mp4' },
      ];
    } else if (
      name.includes('polo') &&
      name.includes('manga') &&
      name.includes('larga') &&
      name.includes('negro')
    ) {
      media = [
        { type: 'image', src: 'assets/polo-manga-larga-negro-1.jpeg' },
        { type: 'image', src: 'assets/polo-manga-larga-negro-2.jpeg' },
        { type: 'image', src: 'assets/polo-manga-larga-negro-3.jpeg' },
        { type: 'video', src: 'assets/polo-manga-larga-negro-video.mp4' },
      ];
    }

    if (media.length === 0) {
      media = [{ type: 'image', src: product.imageUrl }];
    }

    this.productMedia.set(media);
    this.activeMediaIndex.set(0);
  }

  activeMedia() {
    return this.productMedia()[this.activeMediaIndex()];
  }

  nextMedia(): void {
    const total = this.productMedia().length;

    if (total === 0) {
      return;
    }

    this.activeMediaIndex.update(index => (index + 1) % total);
  }

  prevMedia(): void {
    const total = this.productMedia().length;

    if (total === 0) {
      return;
    }

    this.activeMediaIndex.update(index => index === 0 ? total - 1 : index - 1);
  }

  goMedia(index: number): void {
    this.activeMediaIndex.set(index);
  }

  openSizeGuide(): void {
    this.sizeGuideOpen.set(true);
  }

  closeSizeGuide(): void {
    this.sizeGuideOpen.set(false);
  }

  loadRelatedProducts(currentProductId: number): void {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        const related = (products || [])
          .filter(item => item.id !== currentProductId)
          .slice(0, 4);

        this.relatedProducts.set(related);
      },
      error: () => {
        this.relatedProducts.set([]);
      },
    });
  }
  relatedHoverImageFor(product: Product): string {
  const name = (product.name || '').toLowerCase();

  if (name.includes('blanca')) {
    return 'assets/polera-blanca-2.jpeg';
  }

  if (name.includes('morada')) {
    return 'assets/polera-morada-2.jpeg';
  }

  if (name.includes('plomo') || name.includes('oscuro')) {
    return 'assets/polera-plomo-2.jpeg';
  }

  if (name.includes('negra') && name.includes('polera')) {
    return 'assets/polera-negra-2.jpeg';
  }

  if (name.includes('verde')) {
    return 'assets/polera-verde-2.jpeg';
  }

  if (
    name.includes('polo') &&
    name.includes('manga') &&
    name.includes('larga') &&
    name.includes('negro')
  ) {
    return 'assets/polo-manga-larga-negro-2.jpeg';
  }

  return product.imageUrl;
}

  sizesList(): string[] {
    const product = this.product();

    if (!product) {
      return [];
    }

    if (product.sizes && String(product.sizes).trim() !== '') {
      return String(product.sizes)
        .split(',')
        .map(size => size.trim())
        .filter(size => size.length > 0);
    }

    return ['S', 'M', 'L', 'XL'];
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
        selectedColor: product.color || 'No especificado',
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