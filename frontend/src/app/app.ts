import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService, Product } from './services/api.service';
import { AuthService, AuthUser } from './services/auth.service';
import { ElementRef, ViewChild } from '@angular/core';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface PublicHomeSettings {
  id: number;
  storeName: string;
  logoUrl: string;
  topBarText: string;

  menuInicio: string;
  menuTienda: string;
  menuExclusivo: string;
  menuNosotros: string;
  menuContacto: string;
  menuMisPedidos: string;

  heroTag: string;
  heroTitle: string;
  heroButtonText: string;
  heroButtonLink: string;

  whatsappNumber: string;
  whatsappEnabled: boolean;
  active: boolean;
}

interface HeroSlideView {
  id?: number;
  type: 'image' | 'video';
  src: string;
  mobileSrc?: string;
  subtitle: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  desktopPosition: string;
  mobilePosition: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  @ViewChild('productsCarousel') productsCarousel?: ElementRef<HTMLDivElement>;

  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);
  cartOpen = signal(false);
  termsOpen = signal(false);

  activeHeroSlide = signal(0);
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);

  currentUser = signal<AuthUser | null>(null);
  currentRoute = signal('');

  private heroInterval: any;

  // ==========================
  // INICIO DINÁMICO DESDE ADMIN
  // ==========================

  heroSlides = signal<HeroSlideView[]>([
    {
      type: 'image',
      src: 'assets/principal1.jpg',
      mobileSrc: 'assets/principal1.jpg',
      subtitle: 'NUEVA COLECCIÓN',
      title: 'OVERSIZE',
      buttonText: 'Comprar ahora',
      buttonLink: '#producto',
      desktopPosition: 'center center',
      mobilePosition: 'center center'
    },
    {
      type: 'image',
      src: 'assets/principal2.jpeg',
      mobileSrc: 'assets/principal2.jpeg',
      subtitle: 'JONZKO SPORT',
      title: 'ESTILO URBANO',
      buttonText: 'Ver productos',
      buttonLink: '#producto',
      desktopPosition: 'center center',
      mobilePosition: 'center center'
    },
    {
      type: 'image',
      src: 'assets/principal3.jpeg',
      mobileSrc: 'assets/principal3.jpeg',
      subtitle: 'MODA PERUANA',
      title: 'BLACK & WHITE',
      buttonText: 'Descubrir prendas',
      buttonLink: '#producto',
      desktopPosition: 'center center',
      mobilePosition: 'center center'
    }
  ]);

  topBarItems = signal<string[]>([
    'ENVÍOS A TODO EL PERÚ',
    'COMPRA SEGURA',
    'CAMBIOS DISPONIBLES',
    'JONZKO SPORT'
  ]);

  menuInicio = signal('INICIO');
  menuTienda = signal('TIENDA');
  menuExclusivo = signal('EXCLUSIVO');
  menuNosotros = signal('NOSOTROS');
  menuContacto = signal('CONTACTO');
  menuMisPedidos = signal('MIS PEDIDOS');
  whatsappEnabled = signal(true);

  // ==========================
  // CONFIGURACIÓN VISUAL GENERAL
  // ==========================

  storeName = signal('JONZKO');
  slogan = signal('ROPA URBANA PERUANA');

  heroTitle = signal('JONZKO');
  heroDescription = signal('Ropa urbana peruana con presencia, estilo propio y actitud.');
  primaryButton = signal('Comprar ahora');
  secondaryButton = signal('Ver colección');

  logoUrl = signal('assets/logo.png');
  heroImageUrl = signal('assets/polera.jpg');

  collectionTag = signal('EDICIÓN LIMITADA');
  collectionTitle = signal('Exclusivo');
  collectionDescription = signal('Poleras urbanas exclusivas de JONZKO.');

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
    this.loadHomeConfig();
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
        this.loadHomeConfig();
        this.loadCurrentUser();

        this.closeCart();
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.heroInterval);
  }

  // ==========================
  // INICIO / HOME DESDE ADMIN
  // ==========================

loadHomeConfig(): void {
  this.apiService.getHomeSettings().subscribe({
    next: (settings: PublicHomeSettings) => {
      this.storeName.set(settings.storeName || 'JONZKO');
      this.logoUrl.set(settings.logoUrl || 'assets/logo.jpg');

      this.menuInicio.set(settings.menuInicio || 'INICIO');
      this.menuTienda.set(settings.menuTienda || 'TIENDA');
      this.menuExclusivo.set(settings.menuExclusivo || 'EXCLUSIVO');
      this.menuNosotros.set(settings.menuNosotros || 'NOSOTROS');
      this.menuContacto.set(settings.menuContacto || 'CONTACTO');
      this.menuMisPedidos.set(settings.menuMisPedidos || 'MIS PEDIDOS');

      this.heroTitle.set(settings.heroTitle || 'BLACK & WHITE');
      this.primaryButton.set(settings.heroButtonText || 'DESCUBRIR PRENDAS');

      this.whatsappEnabled.set(settings.whatsappEnabled !== false);

      const topText =
        settings.topBarText ||
        'ENVÍOS A TODO EL PERÚ • COMPRA SEGURA • CAMBIOS DISPONIBLES • JONZKO SPORT';

      this.topBarItems.set(
        topText
          .split('•')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      );

      const phone = settings.whatsappNumber || '51998989599';
      const message = 'Hola, quiero información sobre JONZKO.';

      this.whatsappUrl.set(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      );

      // Cargar slides usando los textos generales del inicio
      this.loadHomeSlidesWithSettings(settings);
    },
    error: (error) => {
      console.error('Error cargando configuración de inicio:', error);
      this.loadHomeSlidesWithSettings(null);
    }
  });
}

loadHomeSlidesWithSettings(settings: PublicHomeSettings | null): void {
  this.apiService.getHomeSlides().subscribe({
    next: (slides: any[]) => {
      const generalTag = settings?.heroTag || 'MODA PERUANA';
      const generalTitle = settings?.heroTitle || 'BLACK & WHITE';
      const generalButton = settings?.heroButtonText || 'DESCUBRIR PRENDAS';
      const generalButtonLink = settings?.heroButtonLink || '#producto';

      const activeSlides = (slides || [])
        .filter(slide => slide.active !== false)
        .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
        .map(slide => {
          const hasVideo = !!slide.videoUrl;

          return {
            id: slide.id,
            type: hasVideo ? 'video' : 'image',
            src: hasVideo ? slide.videoUrl : slide.desktopImageUrl,
            mobileSrc: slide.mobileImageUrl || slide.desktopImageUrl,

            // AHORA MANDA LO DEL ADMIN GENERAL
           subtitle: slide.tagText || generalTag,
title: slide.title || generalTitle,
buttonText: slide.buttonText || generalButton,
buttonLink: slide.buttonLink || generalButtonLink,

            desktopPosition: slide.desktopPosition || 'center center',
            mobilePosition: slide.mobilePosition || 'center center'
          } as HeroSlideView;
        })
        .filter(slide => !!slide.src);

      if (activeSlides.length > 0) {
        this.heroSlides.set(activeSlides);
        this.activeHeroSlide.set(0);
        this.restartHeroAutoplay();
      } else {
        // Si no hay slides creados, igual usa los textos del admin con imágenes antiguas
        this.heroSlides.set([
          {
            type: 'image',
            src: 'assets/principal1.jpg',
            mobileSrc: 'assets/principal1.jpg',
            subtitle: generalTag,
            title: generalTitle,
            buttonText: generalButton,
            buttonLink: generalButtonLink,
            desktopPosition: 'center center',
            mobilePosition: 'center center'
          }
        ]);

        this.activeHeroSlide.set(0);
        this.restartHeroAutoplay();
      }
    },
    error: (error) => {
      console.error('Error cargando slides de inicio:', error);
    }
  });
}

  heroImageFor(slide: HeroSlideView): string {
    return slide.src;
  }

  heroMobileImageFor(slide: HeroSlideView): string {
    return slide.mobileSrc || slide.src;
  }

  heroObjectPosition(slide: HeroSlideView): string {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return slide.mobilePosition || 'center center';
    }

    return slide.desktopPosition || 'center center';
  }

  // ==========================
  // HERO CARRUSEL
  // ==========================

  startHeroAutoplay(): void {
    clearInterval(this.heroInterval);

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

    if (total === 0) {
      return;
    }

    const next = (this.activeHeroSlide() + 1) % total;
    this.activeHeroSlide.set(next);
  }

  prevHeroSlide(): void {
    const total = this.heroSlides().length;

    if (total === 0) {
      return;
    }

    const prev = this.activeHeroSlide() === 0 ? total - 1 : this.activeHeroSlide() - 1;
    this.activeHeroSlide.set(prev);
    this.restartHeroAutoplay();
  }

  // ==========================
  // MENÚS
  // ==========================

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(value => !value);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  openCustomerLogin(): void {
    alert('Aquí irá el inicio de sesión del cliente. El administrador entra aparte por /admin-login.');
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
      this.currentRoute().startsWith('/reset-password') ||
      this.currentRoute().startsWith('/checkout') ||
      this.currentRoute().startsWith('/mis-pedidos') ||
      this.currentRoute().startsWith('/tienda')
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

  scrollProducts(direction: 'left' | 'right'): void {
    const carousel = this.productsCarousel?.nativeElement;

    if (!carousel) {
      return;
    }

    const scrollAmount = carousel.clientWidth * 0.8;

    carousel.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }

  cleanProductName(name: string): string {
    return name
      .replace(/JONZKO/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
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
  // CONFIGURACIÓN WEB GENERAL
  // ==========================

  loadWebConfig(): void {
    this.apiService.getSettings().subscribe({
      next: (config: any) => {
        this.slogan.set(config.slogan || 'ROPA URBANA PERUANA');

        this.heroDescription.set(
          config.heroDescription || 'Ropa urbana peruana con presencia, estilo propio y actitud.'
        );

        this.secondaryButton.set(config.secondaryButtonText || 'Ver colección');

        this.heroImageUrl.set(config.heroImageUrl || 'assets/polera.jpg');

        this.collectionTag.set(config.collectionTag || 'EDICIÓN LIMITADA');

        const savedCollectionTitle = String(config.collectionTitle || '').trim();
        const fixedCollectionTitle =
          !savedCollectionTitle ||
          savedCollectionTitle.toLowerCase() === 'producto' ||
          savedCollectionTitle.toLowerCase() === 'productos'
            ? 'Exclusivo'
            : savedCollectionTitle;

        this.collectionTitle.set(fixedCollectionTitle);
        this.collectionDescription.set(
          config.collectionDescription || 'Poleras urbanas exclusivas de JONZKO.'
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
      },
      error: (error) => {
        console.error('Error cargando configuración web desde MySQL:', error);
      }
    });
  }

  // ==========================
  // TÉRMINOS
  // ==========================

  openTerms(): void {
    this.termsOpen.set(true);
  }

  closeTerms(): void {
    this.termsOpen.set(false);
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