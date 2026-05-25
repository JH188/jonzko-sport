import { Component, OnInit, signal } from '@angular/core';
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
export class App implements OnInit {
  openCustomerLogin(): void {
  alert('Aquí irá el inicio de sesión del cliente. El administrador entra aparte por /admin-login.');
}
  products = signal<Product[]>([]);
cart = signal<CartItem[]>([]);
cartOpen = signal(false);

currentUser = signal<AuthUser | null>(null);

currentRoute = signal('');

  // ==========================
  // CONFIGURACIÓN VISUAL
  // ==========================
  storeName = signal('JONZKO');
  slogan = signal('ROPA URBANA PERUANA');

  heroTitle = signal('JONZKO');
  heroDescription = signal('Ropa urbana con presencia, estilo y visión empresarial.');
  primaryButton = signal('Comprar ahora');
  secondaryButton = signal('Ver colección');

  logoUrl = signal('assets/logo.jpg');
  heroImageUrl = signal('assets/polera.jpg');

  collectionTag = signal('100% ALGODON');
  collectionTitle = signal('Colección inicial');
  collectionDescription = signal('Productos oficiales disponibles para compra online.');

  aboutTitle = signal('Sobre JONZKO');
  aboutDescription = signal(
    'Marca urbana peruana creada con visión empresarial, estilo propio y presencia moderna.'
  );

  instagramUrl = signal('https://www.instagram.com/jonzko.o/');
  facebookUrl = signal('https://www.facebook.com/profile.php?id=61563952841904');
  tiktokUrl = signal('https://www.tiktok.com/@jonzko1');
  whatsappUrl = signal('https://wa.me/51999999999');

  constructor(
  private apiService: ApiService,
  private router: Router,
  private authService: AuthService
) {}

 ngOnInit(): void {
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
  });
  }
  // ==========================
// USUARIO / SESIÓN
// ==========================
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

  // ==========================
  // CONFIGURACIÓN WEB
  // ==========================
  loadWebConfig(): void {
    const savedConfig = localStorage.getItem('jonzko_web_config');

    if (!savedConfig) {
      return;
    }

    try {
      const config = JSON.parse(savedConfig);

      this.storeName.set(config.storeName || 'JONZKO');
      this.slogan.set(config.slogan || 'ROPA URBANA PERUANA');

      this.heroTitle.set(config.heroTitle || 'JONZKO');
      this.heroDescription.set(
        config.heroDescription || 'Ropa urbana con presencia, estilo y visión empresarial.'
      );

      this.primaryButton.set(config.primaryButton || 'Comprar ahora');
      this.secondaryButton.set(config.secondaryButton || 'Ver colección');

      this.logoUrl.set(config.logoUrl || 'assets/logo.jpg');
      this.heroImageUrl.set(config.heroImageUrl || 'assets/polera.jpg');

      this.collectionTag.set(config.collectionTag || '100% ALGODON');
      this.collectionTitle.set(config.collectionTitle || 'Colección inicial');
      this.collectionDescription.set(
        config.collectionDescription || 'Productos oficiales disponibles para compra online.'
      );

      this.aboutTitle.set(config.aboutTitle || 'Sobre JONZKO');
      this.aboutDescription.set(
        config.aboutDescription ||
          'Marca urbana peruana creada con visión empresarial, estilo propio y presencia moderna.'
      );

      this.instagramUrl.set(config.instagramUrl || 'https://www.instagram.com/jonzko.o/');
      this.facebookUrl.set(
        config.facebookUrl || 'https://www.facebook.com/profile.php?id=61563952841904'
      );
      this.tiktokUrl.set(config.tiktokUrl || 'https://www.tiktok.com/@jonzko1');
      this.whatsappUrl.set(config.whatsappUrl || 'https://wa.me/51999999999');

    } catch (error) {
      console.error('Error leyendo configuración web:', error);
    }
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
    alert('Primero debes iniciar sesión o registrarte para continuar con tu compra.');
    this.closeCart();
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