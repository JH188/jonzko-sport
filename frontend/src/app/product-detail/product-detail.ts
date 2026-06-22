import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService, Product } from '../services/api.service';

type ProductMedia = {
  type: 'image' | 'video';
  src: string;
};

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

  productMedia = signal<ProductMedia[]>([]);
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
    const media: ProductMedia[] = [];

    const addImage = (src?: string | null): void => {
      const cleanSrc = String(src || '').trim();

      if (cleanSrc) {
        media.push({
          type: 'image',
          src: cleanSrc,
        });
      }
    };

   const addVideo = (src?: string | null): void => {
  const cleanSrc = String(src || '').trim();

  if (cleanSrc) {
    media.push({
      type: 'video',
      src: cleanSrc,
    });
  }
};;

    addImage(product.imageUrl);
    addImage(product.imageUrl2);
    addImage(product.imageUrl3);
    addVideo(product.videoUrl);

    this.productMedia.set(media);
    this.activeMediaIndex.set(0);
  }

  activeMedia(): ProductMedia | undefined {
    return this.productMedia()[this.activeMediaIndex()];
  }
  playVideo(event: Event): void {
  const video = event.target as HTMLVideoElement;

  if (!video) {
    return;
  }

  video.muted = true;

  video.play().catch(() => {
    console.log('El navegador bloqueó la reproducción automática. Dale play manual.');
  });
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
    return product.imageUrl2 || product.imageUrl3 || product.imageUrl;
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