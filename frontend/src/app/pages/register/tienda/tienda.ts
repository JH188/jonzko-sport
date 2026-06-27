import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

interface StoreProduct {
  [key: string]: any;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css'
})
export class TiendaComponent implements OnInit {
  products: StoreProduct[] = [];
  loading = true;

  searchTerm = '';
  selectedCategory = 'Todos';
  selectedSize = 'Todas';
  selectedPrice = 'todos';
  selectedOrder = 'recientes';

  skeletonItems = Array.from({ length: 8 });

  private readonly apiUrl = 'https://jonzko-sport-production.up.railway.app/api/products';

  private readonly defaultProducts: StoreProduct[] = [
{
  id: 'demo-1',
  name: 'Polo básico negro entallado',
  category: 'Polo básico',
  description: 'Corte normal entallado para uso diario.',
  price: 29.99,
  oldPrice: 39.99,
  stock: 10,
  sizes: ['S', 'M', 'L'],
  imageUrl: 'assets/polo-negro.pc.png',
  desktopImageUrl: 'assets/polo-negro.pc.png',
  mobileImageUrl: 'assets/polo-negro-1.png',
  createdAt: '2026-06-20'
},
    {
      id: 'demo-2',
      name: 'Polo básico blanco',
      category: 'Polo básico',
      description: 'Modelo básico de caída limpia.',
      price: 49.99,
      stock: 9,
      sizes: ['S', 'M', 'L', 'XL'],
      createdAt: '2026-06-19'
    },
    {
      id: 'demo-3',
      name: 'Polo básico plomo',
      category: 'Polo básico',
      description: 'Polo simple y fácil de combinar.',
      price: 52.99,
      stock: 8,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-18'
    },
    {
      id: 'demo-4',
      name: 'Polo básico negro',
      category: 'Polo básico',
      description: 'Modelo básico con ajuste cómodo.',
      price: 54.99,
      oldPrice: 64.99,
      stock: 7,
      sizes: ['S', 'M', 'L'],
      createdAt: '2026-06-17'
    },
    {
      id: 'demo-5',
      name: 'Polo básico blanco',
      category: 'Polo básico',
      description: 'Polo básico para outfit diario.',
      price: 49.99,
      stock: 11,
      sizes: ['S', 'M', 'L', 'XL'],
      createdAt: '2026-06-16'
    },
    {
      id: 'demo-6',
      name: 'Polo básico plomo',
      category: 'Polo básico',
      description: 'Prenda cómoda y ligera.',
      price: 55.99,
      stock: 6,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-15'
    },
    {
      id: 'demo-7',
      name: 'Polo oversize negro',
      category: 'Polo oversize',
      description: 'Corte amplio y caída relajada.',
      price: 69.99,
      oldPrice: 79.99,
      stock: 8,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-14'
    },
    {
      id: 'demo-8',
      name: 'Polo oversize blanco',
      category: 'Polo oversize',
      description: 'Oversize amplio para uso diario.',
      price: 69.99,
      stock: 9,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-13'
    },
    {
      id: 'demo-9',
      name: 'Polo oversize plomo',
      category: 'Polo oversize',
      description: 'Modelo amplio de caída suelta.',
      price: 72.99,
      stock: 7,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-12'
    },
    {
      id: 'demo-10',
      name: 'Polo oversize negro',
      category: 'Polo oversize',
      description: 'Oversize con forma más ancha.',
      price: 74.99,
      oldPrice: 84.99,
      stock: 5,
      sizes: ['L', 'XL'],
      createdAt: '2026-06-11'
    },
    {
      id: 'demo-11',
      name: 'Polo oversize blanco',
      category: 'Polo oversize',
      description: 'Prenda oversize para combinar fácil.',
      price: 71.99,
      stock: 6,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-10'
    },
    {
      id: 'demo-12',
      name: 'Polo oversize plomo',
      category: 'Polo oversize',
      description: 'Modelo amplio para estilo suelto.',
      price: 73.99,
      stock: 4,
      sizes: ['M', 'L', 'XL'],
      createdAt: '2026-06-09'
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

loadProducts(): void {
  this.loading = true;

  this.http.get<any>(this.apiUrl)
    .pipe(catchError(() => of([])))
    .subscribe((response) => {
      const backendProducts = this.extractProductList(response)
        .filter((product) => this.isProductVisible(product))
        .filter((product) => this.isAllowedType(product))
        .map((product) => this.prepareProductForStore(product));

      if (backendProducts.length >= 8) {
        this.products = backendProducts;
      } else {
        this.products = this.defaultProducts.map((product) => this.prepareProductForStore(product));
      }

      this.loading = false;
    });
}
private prepareProductForStore(product: StoreProduct): StoreProduct {
  const price = this.toNumber(
    product?.['price']
    ?? product?.['precio']
    ?? product?.['salePrice']
    ?? product?.['precioVenta']
    ?? 0
  );

  return {
    ...product,
    imageUrl: product?.['imageUrl'] || product?.['imagenUrl'] || 'assets/polo-negro.pc.png',
    oldPrice: price > 0 ? Number((price + 10).toFixed(2)) : 0
  };
}

  private extractProductList(response: any): StoreProduct[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.['content'])) return response['content'];
    if (Array.isArray(response?.['data'])) return response['data'];
    if (Array.isArray(response?.['products'])) return response['products'];
    if (Array.isArray(response?.['productos'])) return response['productos'];
    return [];
  }

  private isProductVisible(product: StoreProduct): boolean {
    return product?.['active'] !== false
      && product?.['activo'] !== false
      && product?.['enabled'] !== false
      && product?.['visible'] !== false
      && product?.['status'] !== 'INACTIVE'
      && product?.['estado'] !== 'INACTIVO';
  }

  private isAllowedType(product: StoreProduct): boolean {
    const text = `${this.getName(product)} ${this.getCategory(product)} ${this.getDescription(product)}`
      .toLowerCase();

    return text.includes('polo');
  }

  get categories(): string[] {
    return ['Todos', 'Polo básico', 'Polo oversize'];
  }

  get sizes(): string[] {
    const result = new Set<string>();

    this.products.forEach((product) => {
      this.getProductSizes(product).forEach((size) => result.add(size));
    });

    return ['Todas', ...Array.from(result).sort()];
  }

  get filteredProducts(): StoreProduct[] {
    const search = this.normalize(this.searchTerm);

    let list = this.products.filter((product) => {
      const name = this.normalize(this.getName(product));
      const category = this.normalize(this.getCategory(product));
      const description = this.normalize(this.getDescription(product));
      const price = this.getPrice(product);
      const sizes = this.getProductSizes(product).map((size) => this.normalize(size));

      const matchSearch =
        !search ||
        name.includes(search) ||
        category.includes(search) ||
        description.includes(search);

      const matchCategory =
        this.selectedCategory === 'Todos' ||
        this.getCategory(product) === this.selectedCategory;

      const matchSize =
        this.selectedSize === 'Todas' ||
        sizes.includes(this.normalize(this.selectedSize));

      const matchPrice =
        this.selectedPrice === 'todos' ||
        (this.selectedPrice === 'menos-50' && price < 50) ||
        (this.selectedPrice === '50-80' && price >= 50 && price <= 80) ||
        (this.selectedPrice === '80-120' && price > 80 && price <= 120) ||
        (this.selectedPrice === '120-mas' && price > 120);

      return matchSearch && matchCategory && matchSize && matchPrice;
    });

    list = [...list].sort((a, b) => {
      if (this.selectedOrder === 'menor-precio') {
        return this.getPrice(a) - this.getPrice(b);
      }

      if (this.selectedOrder === 'mayor-precio') {
        return this.getPrice(b) - this.getPrice(a);
      }

      if (this.selectedOrder === 'descuento') {
        return this.getDiscountPercent(b) - this.getDiscountPercent(a);
      }

      return this.getCreatedValue(b) - this.getCreatedValue(a);
    });

    return list;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'Todos';
    this.selectedSize = 'Todas';
    this.selectedPrice = 'todos';
    this.selectedOrder = 'recientes';
  }

  getProductRoute(product: StoreProduct): any[] {
    const id = this.getId(product);

    if (String(id).startsWith('demo-')) {
      return ['/tienda'];
    }

    return id ? ['/producto', id] : ['/tienda'];
  }

  isOversize(product: StoreProduct): boolean {
    return this.getCategory(product).toLowerCase().includes('oversize');
  }

  getId(product: StoreProduct): any {
    return product?.['id']
      ?? product?.['productId']
      ?? product?.['productoId']
      ?? product?.['_id'];
  }

  getName(product: StoreProduct): string {
    return String(
      product?.['name']
      ?? product?.['nombre']
      ?? product?.['title']
      ?? product?.['titulo']
      ?? 'Producto'
    ).trim();
  }

  getCategory(product: StoreProduct): string {
    const rawCategory = String(
      product?.['category']
      ?? product?.['categoria']
      ?? product?.['type']
      ?? product?.['tipo']
      ?? ''
    ).trim();

    const text = `${rawCategory} ${this.getName(product)} ${this.getDescription(product)}`.toLowerCase();

    if (text.includes('oversize')) {
      return 'Polo oversize';
    }

    return 'Polo básico';
  }

  getDescription(product: StoreProduct): string {
    return String(
      product?.['description']
      ?? product?.['descripcion']
      ?? product?.['details']
      ?? product?.['detalle']
      ?? 'Producto disponible.'
    ).trim();
  }

  getPrice(product: StoreProduct): number {
    return this.toNumber(
      product?.['price']
      ?? product?.['precio']
      ?? product?.['salePrice']
      ?? product?.['precioVenta']
      ?? 0
    );
  }

  getOldPrice(product: StoreProduct): number {
    return this.toNumber(
      product?.['oldPrice']
      ?? product?.['precioAnterior']
      ?? product?.['regularPrice']
      ?? product?.['precioRegular']
      ?? 0
    );
  }

  hasDiscount(product: StoreProduct): boolean {
    const price = this.getPrice(product);
    const oldPrice = this.getOldPrice(product);

    return oldPrice > 0 && price > 0 && oldPrice > price;
  }

  getDiscountPercent(product: StoreProduct): number {
    const price = this.getPrice(product);
    const oldPrice = this.getOldPrice(product);

    if (!oldPrice || !price || oldPrice <= price) {
      return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  getImage(product: StoreProduct): string {
    
    const image =
      product?.['imageUrl']
      ?? product?.['imagenUrl']
      ?? product?.['image']
      ?? product?.['imagen']
      ?? product?.['photo']
      ?? product?.['foto']
      ?? '';

    if (typeof image === 'string' && image.trim()) {
      return image.trim();
    }

    const galleries = [
      product?.['images'],
      product?.['imagenes'],
      product?.['gallery'],
      product?.['galeria']
    ];

    for (const gallery of galleries) {
      if (Array.isArray(gallery) && gallery.length > 0) {
        const first = gallery[0];

        if (typeof first === 'string') {
          return first;
        }

        const url =
          first?.['url']
          ?? first?.['imageUrl']
          ?? first?.['imagenUrl']
          ?? first?.['src']
          ?? '';

        if (typeof url === 'string' && url.trim()) {
          return url.trim();
        }
      }
    }

    return '';
  }
  getDesktopImage(product: StoreProduct): string {
  return String(
    product?.['desktopImageUrl']
    ?? product?.['imagePcUrl']
    ?? product?.['pcImageUrl']
    ?? this.getImage(product)
  ).trim();
}

getMobileImage(product: StoreProduct): string {
  return String(
    product?.['mobileImageUrl']
    ?? product?.['imageMobileUrl']
    ?? product?.['movilImageUrl']
    ?? this.getDesktopImage(product)
  ).trim();
}

  getProductSizes(product: StoreProduct): string[] {
    const result = new Set<string>();

    const directSizes =
      product?.['sizes']
      ?? product?.['tallas']
      ?? product?.['availableSizes']
      ?? product?.['tallasDisponibles'];

    if (Array.isArray(directSizes)) {
      directSizes.forEach((size) => {
        if (size) {
          result.add(String(size).trim().toUpperCase());
        }
      });
    }

    if (typeof directSizes === 'string') {
      directSizes.split(',').forEach((size) => {
        if (size.trim()) {
          result.add(size.trim().toUpperCase());
        }
      });
    }

    const variants = product?.['variants'] ?? product?.['variantes'] ?? [];

    if (Array.isArray(variants)) {
      variants.forEach((variant) => {
        const size =
          variant?.['size']
          ?? variant?.['talla']
          ?? variant?.['name']
          ?? variant?.['nombre'];

        if (size) {
          result.add(String(size).trim().toUpperCase());
        }
      });
    }

    const oneSize = product?.['size'] ?? product?.['talla'];

    if (oneSize) {
      result.add(String(oneSize).trim().toUpperCase());
    }

    return Array.from(result).filter(Boolean);
  }

  getTotalStock(product: StoreProduct): number | null {
    const variants = product?.['variants'] ?? product?.['variantes'] ?? [];

    if (Array.isArray(variants) && variants.length > 0) {
      return variants.reduce((total, variant) => {
        return total + this.toNumber(
          variant?.['stock']
          ?? variant?.['cantidad']
          ?? 0
        );
      }, 0);
    }

    const stock =
      product?.['stock']
      ?? product?.['cantidad']
      ?? product?.['quantity'];

    if (stock === undefined || stock === null || stock === '') {
      return null;
    }

    return this.toNumber(stock);
  }

  getStockText(product: StoreProduct): string {
    const stock = this.getTotalStock(product);

    if (stock === null) return 'Disponible';
    if (stock <= 0) return 'Sin stock';
    if (stock <= 3) return 'Últimas';
    return 'Disponible';
  }

 trackByProductId = (index: number, product: StoreProduct): any => {
  return product?.['id']
    ?? product?.['productId']
    ?? product?.['productoId']
    ?? product?.['_id']
    ?? index;
};

  private getCreatedValue(product: StoreProduct): number {
    const rawDate =
      product?.['createdAt']
      ?? product?.['fechaCreacion']
      ?? product?.['createdDate']
      ?? product?.['fecha']
      ?? product?.['updatedAt']
      ?? product?.['fechaActualizacion'];

    if (rawDate) {
      const date = new Date(rawDate).getTime();

      if (!Number.isNaN(date)) {
        return date;
      }
    }

    return this.toNumber(this.getId(product));
  }

  private normalize(value: string): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private toNumber(value: any): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }
}