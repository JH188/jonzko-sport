import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService, Product } from './services/api.service';
import { AuthService, AuthUser } from './services/auth.service';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  openCustomerLogin(): void {
  alert('Aquí irá el inicio de sesión del cliente. El administrador entra aparte por /admin-login.');
}
  products = signal<Product[]>([]);
cart = signal<CartItem[]>([]);
cartOpen = signal(false);
termsOpen = signal(false);

openTerms(): void {
  this.termsOpen.set(true);
}

closeTerms(): void {
  this.termsOpen.set(false);
}
activeHeroSlide = signal(0);
mobileMenuOpen = signal(false);
userMenuOpen = signal(false);

toggleUserMenu(): void {
  this.userMenuOpen.update(value => !value);
}

closeUserMenu(): void {
  this.userMenuOpen.set(false);
}
private heroInterval: any;

heroSlides = signal([
  {
    type: 'image',
    src: 'assets/principal1.jpg',
    subtitle: 'NUEVA COLECCIÓN',
    title: 'OVERSIZE',
    buttonText: 'Comprar ahora',
  },
  {
    type: 'image',
    src: 'assets/principal2.jpeg',
    subtitle: 'JONZKO SPORT',
    title: 'ESTILO URBANO',
    buttonText: 'Ver productos',
  },
  {
    type: 'image',
    src: 'assets/principal3.jpeg',
    subtitle: 'MODA PERUANA',
    title: 'BLACK & WHITE',
    buttonText: 'Descubrir prendas',
  },
]);
toggleMobileMenu(): void {
  this.mobileMenuOpen.update(value => !value);
}

closeMobileMenu(): void {
  this.mobileMenuOpen.set(false);
}

startHeroAutoplay(): void {
  this.heroInterval = setInterval(() => {
    this.nextHeroSlide();
  }, 4500);
}

restartHeroAutoplay(): void {
  clearInterval(this.heroInterval);
  this.startHeroAutoplay();
}

goHeroSlide(index: number): void {
  this.activeHeroSlide.set(index);
  this.restartHeroAutoplay();
}

nextHeroSlide(): void {
  const total = this.heroSlides().length;
  const next = (this.activeHeroSlide() + 1) % total;
  this.activeHeroSlide.set(next);
  this.restartHeroAutoplay();
}

prevHeroSlide(): void {
  const total = this.heroSlides().length;
  const prev = this.activeHeroSlide() === 0 ? total - 1 : this.activeHeroSlide() - 1;
  this.activeHeroSlide.set(prev);
  this.restartHeroAutoplay();
}
currentUser = signal<AuthUser | null>(null);

currentRoute = signal('');

  // ==========================
  // CONFIGURACIÓN VISUAL
  // ==========================
  storeName = signal('JONZKO');
  slogan = signal('ROPA URBANA PERUANA');

  heroTitle = signal('JONZKO');
  heroDescription = signal('Ropa urbana peruana con presencia, estilo propio y actitud.');
  primaryButton = signal('Comprar ahora');
  secondaryButton = signal('Ver colección');

  logoUrl = signal('assets/logo.png');
  heroImageUrl = signal('assets/polera.jpg');

  collectionTag = signal('ROPA URBANA');
  collectionTitle = signal('Nuestro Producto');
  collectionDescription = signal('Productos oficiales disponibles para compra online.');

  aboutTitle = signal('Sobre Nosotros');
  aboutDescription = signal(
    'Marca urbana peruana creada con estilo propio, presencia moderna y esencia urbana.'
  );

  instagramUrl = signal('https://www.instagram.com/jonzko.o/');
  facebookUrl = signal('https://www.facebook.com/profile.php?id=61563952841904');
  tiktokUrl = signal('https://www.tiktok.com/@jonzko1');
  whatsappUrl = signal('https://wa.me/51998989599');

  constructor(
  private apiService: ApiService,
  private router: Router,
  private authService: AuthService
) {}

 ngOnInit(): void {
  this.startHeroAutoplay();
  this.loadWebConfig();
  this.loadProducts();
  this.loadCart();
  this.loadCurrentUser();

  window.addEventListener('jonzko-cart-updated', () => {
    this.loadCart();
    this.openCart();
  });
  this.currentRoute.set(this.router.url);

   this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: any) => {
    this.currentRoute.set(event.urlAfterRedirects);
    this.loadWebConfig();
    this.loadCurrentUser();
    this.closeCart();
    this.closeMobileMenu();
  });
  }
  // ==========================
// USUARIO / SESIÓN
// ==========================
ngOnDestroy(): void {
  clearInterval(this.heroInterval);
}
loadCurrentUser(): void {
  this.currentUser.set(this.authService.getUser());
}

logout(): void {
  this.authService.logout();
  this.currentUser.set(null);
  this.router.navigate(['/']);
}

  // ==========================
  // RUTAS
  // ==========================
  isAdminRoute(): boolean {
    return this.currentRoute().startsWith('/admin');
  }
  isProductDetailRoute(): boolean {
  return this.currentRoute().startsWith('/producto');
}
isStandalonePageRoute(): boolean {
  return (
    this.currentRoute().startsWith('/producto') ||
    this.currentRoute().startsWith('/login') ||
    this.currentRoute().startsWith('/registro') ||
    this.currentRoute().startsWith('/checkout') ||
    this.currentRoute().startsWith('/mis-pedidos')
  );
}

goToProductDetail(productId: number): void {
  this.router.navigate(['/producto', productId]);
}

  goToAdminLogin(): void {
    this.router.navigate(['/admin-login']);
  }

  // ==========================
  // PRODUCTOS
  // ==========================
  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products || []);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });
  }
cleanProductName(name: string): string {
  return name
    .replace(/JONZKO/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
  // ==========================
  // CONFIGURACIÓN WEB
  // ==========================
loadWebConfig(): void {
  this.apiService.getSettings().subscribe({
    next: (config: any) => {
      this.storeName.set(config.storeName || 'JONZKO');
      this.slogan.set(config.slogan || 'ROPA URBANA PERUANA');

      this.heroTitle.set(config.heroTitle || 'JONZKO');
      this.heroDescription.set(
        config.heroDescription || 'Ropa urbana peruana con presencia, estilo propio y actitud.'
      );

      this.primaryButton.set(config.primaryButtonText || 'Comprar ahora');
      this.secondaryButton.set(config.secondaryButtonText || 'Ver colección');

      this.logoUrl.set('assets/logo.png');
      this.heroImageUrl.set(config.heroImageUrl || 'assets/polera.jpg');

      this.collectionTag.set('ROPA URBANA');
      this.collectionTitle.set(config.collectionTitle || 'Nuestro Producto');
      this.collectionDescription.set(
        config.collectionDescription || 'Productos oficiales disponibles para compra online.'
      );

      this.aboutTitle.set('Sobre Nosotros');
      this.aboutDescription.set(
        config.contactDescription ||
          'Marca urbana peruana creada con estilo propio, presencia moderna y esencia urbana.'
      );

      this.instagramUrl.set(config.instagramUrl || 'https://www.instagram.com/jonzko.o/');
      this.facebookUrl.set(
        config.facebookUrl || 'https://www.facebook.com/profile.php?id=61563952841904'
      );
      this.tiktokUrl.set(config.tiktokUrl || 'https://www.tiktok.com/@jonzko1');

      const phone = config.whatsappNumber || '51998989599';
      const message = config.whatsappMessage || 'Hola, quiero información sobre JONZKO.';

      this.whatsappUrl.set(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      );
    },
    error: (error) => {
      console.error('Error cargando configuración web desde MySQL:', error);
      this.whatsappUrl.set('https://wa.me/51998989599');
    }
  });
}
hoverImageFor(product: Product): string {
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
    return 'assets/polera-negra-2.jpg';
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
    return 'assets/polo-manga-larga-negro-2.jpg';
  }

  return product.imageUrl;
}

discountPercent(product: Product): number {
  const oldPrice = Number(product.oldPrice || 0);
  const price = Number(product.price || 0);

  if (!oldPrice || !price || oldPrice <= price) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
  // ==========================
  // CARRITO
  // ==========================
  toggleCart(): void {
  this.loadCart();
  this.cartOpen.update(value => !value);
}

  openCart(): void {
    this.cartOpen.set(true);
  }

  closeCart(): void {
    this.cartOpen.set(false);
  }

  addToCart(product: Product): void {
    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item.id === product.id);

    if (existingItem) {
      const updatedCart = currentCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      this.cart.set(updatedCart);
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1
      };

      this.cart.set([...currentCart, newItem]);
    }

    this.saveCart();
    this.openCart();
  }

  increaseQty(productId: number): void {
    const updatedCart = this.cart().map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    this.cart.set(updatedCart);
    this.saveCart();
  }

  decreaseQty(productId: number): void {
    const updatedCart = this.cart()
      .map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0);

    this.cart.set(updatedCart);
    this.saveCart();
  }

  removeFromCart(productId: number): void {
    const updatedCart = this.cart().filter(item => item.id !== productId);

    this.cart.set(updatedCart);
    this.saveCart();
  }

  clearCart(): void {
    this.cart.set([]);
    this.saveCart();
  }

  cartCount(): number {
    return this.cart().reduce((total, item) => total + item.quantity, 0);
  }

  cartTotal(): number {
    return this.cart().reduce(
      (total, item) => total + Number(item.price || 0) * item.quantity,
      0
    );
  }

  saveCart(): void {
    localStorage.setItem('jonzko_cart', JSON.stringify(this.cart()));
  }

  loadCart(): void {
    const savedCart = localStorage.getItem('jonzko_cart');

    if (!savedCart) {
      return;
    }

    try {
      const parsedCart = JSON.parse(savedCart);
      this.cart.set(parsedCart || []);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      this.cart.set([]);
    }
  }

goCheckout(): void {
  if (this.cart().length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const user = this.authService.getUser();

  if (!user) {
  this.closeCart();
  this.cartOpen.set(false);
  this.router.navigate(['/login']);
  return;
}

  this.closeCart();
  this.cartOpen.set(false);
  this.router.navigate(['/checkout']);
}
  goToCheckout(): void {
  this.goCheckout();
}
}