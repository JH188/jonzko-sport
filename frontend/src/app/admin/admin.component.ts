import { Component, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



import {
  ApiService,
  Product,
  ProductRequest,
  OrderResponse,
  UserResponse
} from '../services/api.service';
type ProductMediaField = 'imageUrl' | 'imageUrl2' | 'imageUrl3' | 'videoUrl';
type AdminSection =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'users'
  | 'reports'
  | 'customization'
  | 'more';

interface WebConfig {
  storeName: string;
  slogan: string;
  logoUrl: string;
  heroImageUrl: string;

  heroTitle: string;
  heroDescription: string;
  primaryButtonText: string;
  secondaryButtonText: string;

  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  whatsappNumber: string;

  navInicio: string;
  navColeccion: string;
  navNosotros: string;
  navContacto: string;
  cartText: string;
  loginText: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  encapsulation: ViewEncapsulation.None
})

export class AdminComponent implements OnInit {
  private companyName = 'JONZKO SPORT';
private companyRuc = '10708448601';
private companyAddress = 'Lima, Perú';
private companyPhone = '999 999 999';
private companyEmail = 'ventas@jonzko.lat';
private companyLogo = 'assets/logo.jpg';
  activeSection = signal<AdminSection>('dashboard');

  products = signal<Product[]>([]);
  orders = signal<OrderResponse[]>([]);
  users = signal<UserResponse[]>([]);

  loading = signal(false);
  editingProductId = signal<number | null>(null);
  selectedOrder = signal<OrderResponse | null>(null);

searchOrderText = '';
statusOrderFilter = 'TODOS';
paymentOrderFilter = 'TODOS';
dateFromFilter = '';
dateToFilter = '';

private lastOrderCount = 0;
soundEnabled = false;
receiptModalOpen = false;

receiptModalTitle = '';
receiptModalContent = '';

currentReceiptOrder: OrderResponse | null = null;
currentReceiptType: 'Voucher' | 'Boleta' | 'Factura' | 'Comprobante' = 'Comprobante';
  productForm: ProductRequest = {
  name: '',
  category: '',
  description: '',
  price: 0,
  oldPrice: 0,
  color: '',
  sizes: 'S,M,L,XL',
  stock: 0,
  saleType: 'NUEVO',
  imageUrl: '',
  imageUrl2: '',
  imageUrl3: '',
  videoUrl: '',
  active: true
};

  webConfig: WebConfig = {
    storeName: 'JONZKO',
    slogan: 'Ropa urbana peruana',
    logoUrl: 'assets/logo.jpg',
    heroImageUrl: 'assets/polera.jpg',

    heroTitle: 'JONZKO',
    heroDescription: 'Ropa urbana con presencia, estilo y visión empresarial.',
    primaryButtonText: 'Comprar ahora',
    secondaryButtonText: 'Ver colección',

    primaryColor: '#0b0b0b',
    secondaryColor: '#ffffff',
    accentColor: '#6b5416',
    backgroundColor: '#f4f4f4',
    textColor: '#111111',

    instagramUrl: 'https://www.instagram.com/jonzko.o/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61563952841904',
    tiktokUrl: 'https://www.tiktok.com/@jonzko1',
    whatsappNumber: '51998989599',

    navInicio: 'Inicio',
    navColeccion: 'Colección',
    navNosotros: 'Nosotros',
    navContacto: 'Contacto',
    cartText: 'Carrito',
    loginText: 'Iniciar sesión'
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

 ngOnInit(): void {
  const isLogged = localStorage.getItem('jonzko_admin_logged');

  if (isLogged !== 'true') {
    this.router.navigate(['/admin-login']);
    return;
  }

  this.loadWebConfig();
  this.applyWebConfig();
  this.loadAdminData();

  setInterval(() => {
    if (this.soundEnabled) {
      this.loadAdminData();
    }
  }, 10000);
}

  setSection(section: AdminSection): void {
    this.activeSection.set(section);
  }

  loadAdminData(): void {
    this.loading.set(true);

    this.apiService.getAdminProducts().subscribe({
      next: (products) => {
        this.products.set(products || []);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });

  this.apiService.getAdminOrders().subscribe({
  next: (orders) => {
    const newOrders = orders || [];

    if (this.soundEnabled && this.lastOrderCount > 0 && newOrders.length > this.lastOrderCount) {
      this.playNewOrderSound();
      alert('🔔 Nuevo pedido registrado en JONZKO.');
    }

    this.orders.set(newOrders);
    this.lastOrderCount = newOrders.length;
    this.loading.set(false);
  },
  error: (error) => {
    console.error('Error cargando pedidos del admin:', error);
    this.loading.set(false);
  }
});

    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users || []);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  // ==========================
  // PRODUCTOS
  // ==========================

  saveProduct(): void {
   const data: ProductRequest = {
  name: (this.productForm.name || '').trim(),
  category: (this.productForm.category || '').trim(),
  description: (this.productForm.description || '').trim(),

  price: Number(this.productForm.price),
  oldPrice: Number(this.productForm.oldPrice || 0),

  color: (this.productForm.color || '').trim(),
  sizes: (this.productForm.sizes || 'S,M,L,XL').trim(),

  stock: Number(this.productForm.stock),
  saleType: (this.productForm.saleType || 'NUEVO').trim(),

  imageUrl: (this.productForm.imageUrl || '').trim(),
  imageUrl2: (this.productForm.imageUrl2 || '').trim(),
  imageUrl3: (this.productForm.imageUrl3 || '').trim(),
  videoUrl: (this.productForm.videoUrl || '').trim(),

  active: this.productForm.active
};

if (!data.name || !data.category || !data.imageUrl) {
  alert('Completa nombre, categoría e imagen del producto.');
  return;
}

    if (data.price <= 0) {
      alert('El precio debe ser mayor a 0.');
      return;
    }

    const productId = this.editingProductId();

    if (productId) {
      this.apiService.updateProduct(productId, data).subscribe({
        next: () => {
          alert('Producto actualizado correctamente.');
          this.resetProductForm();
          this.loadAdminData();
        },
        error: (error) => {
          console.error('Error actualizando producto:', error);
          alert('No se pudo actualizar el producto.');
        }
      });
    } else {
      this.apiService.createProduct(data).subscribe({
        next: () => {
          alert('Producto creado correctamente.');
          this.resetProductForm();
          this.loadAdminData();
        },
        error: (error) => {
          console.error('Error creando producto:', error);
          alert('No se pudo crear el producto.');
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);

    this.productForm = {
  name: product.name,
  category: product.category,
  description: product.description || '',

  price: Number(product.price),
  oldPrice: Number(product.oldPrice || 0),

  color: product.color || '',
  sizes: product.sizes || 'S,M,L,XL',

  stock: Number(product.stock),
  saleType: product.saleType || 'NUEVO',

  imageUrl: product.imageUrl,
  imageUrl2: product.imageUrl2 || '',
  imageUrl3: product.imageUrl3 || '',
  videoUrl: product.videoUrl || '',

  active: product.active
};

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteProduct(productId: number): void {
    const confirmDelete = confirm('¿Deseas eliminar este producto?');

    if (!confirmDelete) {
      return;
    }

    this.apiService.deleteProduct(productId).subscribe({
      next: () => {
        alert('Producto eliminado correctamente.');
        this.loadAdminData();
      },
      error: (error) => {
        console.error('Error eliminando producto:', error);
        alert('No se pudo eliminar el producto.');
      }
    });
  }
  toggleProductVisibility(product: Product): void {
    const newActiveState = !product.active;
    const actionText = newActiveState ? 'mostrar' : 'ocultar';

    const confirmAction = confirm(
      `¿Deseas ${actionText} este producto para los usuarios?`
    );

    if (!confirmAction) {
      return;
    }

    const data: ProductRequest = {
      name: product.name,
      category: product.category,
      description: product.description || '',

      price: Number(product.price),
      oldPrice: Number(product.oldPrice || 0),

      color: product.color || '',
      sizes: product.sizes || 'S,M,L,XL',

      stock: Number(product.stock),
      saleType: product.saleType || 'NUEVO',

      imageUrl: product.imageUrl,
      imageUrl2: product.imageUrl2 || '',
      imageUrl3: product.imageUrl3 || '',
      videoUrl: product.videoUrl || '',

      active: newActiveState
    };

    this.apiService.updateProduct(product.id, data).subscribe({
      next: () => {
        alert(
          newActiveState
            ? 'Producto visible para los usuarios.'
            : 'Producto ocultado para los usuarios.'
        );

        this.loadAdminData();
      },
      error: (error) => {
        console.error('Error cambiando visibilidad del producto:', error);
        alert('No se pudo cambiar la visibilidad del producto.');
      }
    });
  }

  resetProductForm(): void {
    this.editingProductId.set(null);

    this.productForm = {
      name: '',
      category: '',
      description: '',

      price: 0,
      oldPrice: 0,

      color: '',
      sizes: 'S,M,L,XL',

      stock: 0,
      saleType: 'NUEVO',

      imageUrl: '',
      imageUrl2: '',
      imageUrl3: '',
      videoUrl: '',

      active: true
    };
  }
  uploadProductMedia(event: Event, field: ProductMediaField): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];
  const isVideo = field === 'videoUrl';

  if (!isVideo && !file.type.startsWith('image/')) {
    alert('Selecciona una imagen válida.');
    input.value = '';
    return;
  }

  if (isVideo && !file.type.startsWith('video/')) {
    alert('Selecciona un video válido.');
    input.value = '';
    return;
  }

  const maxSizeMb = isVideo ? 50 : 8;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    alert(`El archivo es muy pesado. Máximo ${maxSizeMb} MB.`);
    input.value = '';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  this.loading.set(true);

  this.apiService.uploadProductImage(formData).subscribe({
    next: (response: any) => {
      this.loading.set(false);

      const url = response.imageUrl || response.mediaUrl;

      if (!url) {
        alert('Cloudinary no devolvió URL.');
        input.value = '';
        return;
      }

      this.productForm[field] = url;
      input.value = '';

      alert(isVideo ? 'Video subido correctamente.' : 'Imagen subida correctamente.');
    },
    error: (error) => {
      this.loading.set(false);
      console.error('Error subiendo archivo:', error);

      const message =
        error?.error?.message ||
        error?.message ||
        'No se pudo subir el archivo. Revisa Cloudinary o Railway.';

      alert(message);
      input.value = '';
    }
  });
}

removeProductMedia(field: ProductMediaField): void {
  const confirmRemove = confirm('¿Deseas quitar este archivo del formulario?');

  if (!confirmRemove) {
    return;
  }

  this.productForm[field] = '';
}

  // ==========================
// PEDIDOS PROFESIONAL
// ==========================

openOrderDetail(order: OrderResponse): void {
  this.selectedOrder.set(order);
}

closeOrderDetail(): void {
  this.selectedOrder.set(null);
}

changeOrderStatus(orderId: number, status: string): void {
  const confirmAction = confirm(`¿Deseas cambiar el estado del pedido a "${status}"?`);

  if (!confirmAction) {
    return;
  }

  this.apiService.updateOrderStatus(orderId, status).subscribe({
    next: () => {
      alert(`Pedido actualizado a ${status}.`);
      this.loadAdminData();
    },
    error: (error) => {
      console.error('Error cambiando estado del pedido:', error);
      alert('No se pudo cambiar el estado del pedido.');
    }
  });
}

filteredOrders(): OrderResponse[] {
  const text = this.searchOrderText.trim().toLowerCase();

  return this.orders().filter(order => {
    const itemsText = this.parseItems(order)
      .map(item => `${item.productName || item.name || ''} ${item.selectedSize || ''} ${item.selectedColor || ''}`)
      .join(' ')
      .toLowerCase();

    const matchesText =
      !text ||
      String(order.id).includes(text) ||
      (this.getOrderCode(order) || '').toLowerCase().includes(text)||
      (order.customerName || '').toLowerCase().includes(text) ||
      (order.customerEmail || '').toLowerCase().includes(text) ||
      (order.customerPhone || '').toLowerCase().includes(text) ||
      (order.paymentMethod || '').toLowerCase().includes(text) ||
      itemsText.includes(text);

    const matchesStatus =
      this.statusOrderFilter === 'TODOS' ||
      (order.orderStatus || '').toLowerCase() === this.statusOrderFilter.toLowerCase();

    const matchesPayment =
      this.paymentOrderFilter === 'TODOS' ||
      (order.paymentMethod || '').toLowerCase() === this.paymentOrderFilter.toLowerCase();

    const matchesDate = this.orderDateInRange(order);

return matchesText && matchesStatus && matchesPayment && matchesDate;
  });
}

ordersByStatus(status: string): number {
  return this.orders()
    .filter(order => (order.orderStatus || '').toLowerCase() === status.toLowerCase())
    .length;
}

confirmedOrders(): number {
  return this.ordersByStatus('Confirmado');
}

pendingAdminOrders(): number {
  return this.ordersByStatus('Pendiente');
}

sentOrders(): number {
  return this.ordersByStatus('Enviado');
}

cancelledOrders(): number {
  return this.ordersByStatus('Cancelado');
}

totalRevenue(): number {
  return this.orders()
    .filter(order => (order.orderStatus || '').toLowerCase() === 'confirmado')
    .reduce((total, order) => total + Number(order.total || 0), 0);
}

parseItems(order: OrderResponse): any[] {
  if (order.items && Array.isArray(order.items)) {
    return order.items;
  }

  if (!order.itemsJson) {
    return [];
  }

  try {
    return JSON.parse(order.itemsJson);
  } catch (error) {
    console.error('Error leyendo productos del pedido:', error);
    return [];
  }
}

formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-PE');
}

formatTime(value: string | null | undefined): string {
  if (!value) {
    return 'Sin hora';
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

  // ==========================
  // PERSONALIZACIÓN WEB
  // ==========================

  saveWebConfig(): void {
  this.apiService.updateSettings(this.webConfig as any).subscribe({
    next: (response: any) => {
      this.webConfig = {
        ...this.webConfig,
        ...response
      };

      this.applyWebConfig();
      alert('Configuración guardada correctamente en MySQL.');
    },
    error: (error) => {
      console.error('Error guardando configuración web:', error);
      alert('No se pudo guardar la configuración en MySQL. Revisa backend o Railway.');
    }
  });
}

  loadWebConfig(): void {
  this.apiService.getSettings().subscribe({
    next: (response: any) => {
      this.webConfig = {
        ...this.webConfig,
        ...response
      };

      this.applyWebConfig();
    },
    error: (error) => {
      console.error('Error cargando configuración web:', error);
      this.applyWebConfig();
    }
  });
}

  applyWebConfig(): void {
    document.documentElement.style.setProperty('--jonzko-primary', this.webConfig.primaryColor);
    document.documentElement.style.setProperty('--jonzko-secondary', this.webConfig.secondaryColor);
    document.documentElement.style.setProperty('--jonzko-accent', this.webConfig.accentColor);
    document.documentElement.style.setProperty('--jonzko-bg', this.webConfig.backgroundColor);
    document.documentElement.style.setProperty('--jonzko-text', this.webConfig.textColor);
  }

  resetWebConfig(): void {
    const confirmReset = confirm('¿Deseas restaurar la configuración inicial de la web?');

    if (!confirmReset) {
      return;
    }

    localStorage.removeItem('jonzko_web_config');

    this.webConfig = {
      storeName: 'JONZKO',
      slogan: 'Ropa urbana peruana',
      logoUrl: 'assets/logo.jpg',
      heroImageUrl: 'assets/polera.jpg',

      heroTitle: 'JONZKO',
      heroDescription: 'Ropa urbana con presencia, estilo y visión empresarial.',
      primaryButtonText: 'Comprar ahora',
      secondaryButtonText: 'Ver colección',

      primaryColor: '#0b0b0b',
      secondaryColor: '#ffffff',
      accentColor: '#6b5416',
      backgroundColor: '#f4f4f4',
      textColor: '#111111',

      instagramUrl: 'https://www.instagram.com/jonzko.o/',
      facebookUrl: 'https://www.facebook.com/profile.php?id=61563952841904',
      tiktokUrl: 'https://www.tiktok.com/@jonzko1',
      whatsappNumber: '51998989599',

      navInicio: 'Inicio',
      navColeccion: 'Colección',
      navNosotros: 'Nosotros',
      navContacto: 'Contacto',
      cartText: 'Carrito',
      loginText: 'Iniciar sesión'
    };

    this.applyWebConfig();
    alert('Configuración restaurada.');
  }

  // ==========================
  // NAVEGACIÓN
  // ==========================

  logoutAdmin(): void {
    localStorage.removeItem('jonzko_admin_logged');
    this.router.navigate(['/admin-login']);
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }

  // ==========================
  // MÉTRICAS
  // ==========================

  activeProducts(): number {
    return this.products().filter(product => product.active).length;
  }

  totalSales(): number {
  return this.orders()
    .filter(order => (order.orderStatus || '').toLowerCase() === 'confirmado')
    .reduce((total, order) => total + Number(order.total || 0), 0);
}
 pendingOrders(): number {
  return this.orders()
    .filter(order => (order.orderStatus || '').toLowerCase() === 'pendiente')
    .length;
}

recentOrders(): OrderResponse[] {
  return [...this.orders()]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);
}

recentUsers(): UserResponse[] {
  return [...this.users()]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);
}

recentProducts(): Product[] {
  return [...this.products()]
    .filter(product => product.active)
    .slice(0, 6);
}

  money(value: number | string | null | undefined): string {
    const amount = Number(value || 0);
    return `S/ ${amount.toFixed(2)}`;
  }

  discountPercent(product: Product | ProductRequest): number {
    const oldPrice = Number(product.oldPrice || 0);
    const price = Number(product.price || 0);

    if (oldPrice <= 0 || price <= 0 || oldPrice <= price) {
      return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

statusText(status: string | null | undefined): string {
  const estado = (status || '').toLowerCase();

  if (estado === 'pagado') return 'Pagado';
  if (estado === 'pago por validar') return 'Pago por validar';
  if (estado === 'pendiente') return 'Pendiente';
  if (estado === 'en proceso') return 'En proceso';
  if (estado === 'confirmado') return 'Confirmado';
  if (estado === 'enviado') return 'Enviado';
  if (estado === 'entregado') return 'Entregado';
  if (estado === 'cancelado') return 'Cancelado';

  return status || 'Sin estado';
}

statusClass(status: string | null | undefined): string {
  const estado = (status || '').toLowerCase();

  if (estado === 'pagado') return 'status confirmed';
  if (estado === 'confirmado') return 'status confirmed';
  if (estado === 'entregado') return 'status confirmed';

  if (estado === 'enviado') return 'status process';
  if (estado === 'en proceso') return 'status process';

  if (estado === 'cancelado') return 'status rejected';

  return 'status pending';
}
enableOrderSound(): void {
  this.soundEnabled = true;
  this.playNewOrderSound();
  alert('Sonido de nuevos pedidos activado.');
}

playNewOrderSound(): void {
  try {
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8);
  } catch (error) {
    console.error('No se pudo reproducir sonido:', error);
  }
}

refreshOrdersWithSound(): void {
  this.loadAdminData();
}

orderDateInRange(order: OrderResponse): boolean {
  if (!this.dateFromFilter && !this.dateToFilter) {
    return true;
  }

  if (!order.createdAt) {
    return false;
  }

  const orderDate = new Date(order.createdAt);
  const orderOnlyDate = new Date(
    orderDate.getFullYear(),
    orderDate.getMonth(),
    orderDate.getDate()
  );

  if (this.dateFromFilter) {
    const from = new Date(this.dateFromFilter + 'T00:00:00');
    if (orderOnlyDate < from) {
      return false;
    }
  }

  if (this.dateToFilter) {
    const to = new Date(this.dateToFilter + 'T00:00:00');
    if (orderOnlyDate > to) {
      return false;
    }
  }

  return true;
}

clearOrderFilters(): void {
  this.searchOrderText = '';
  this.statusOrderFilter = 'TODOS';
  this.paymentOrderFilter = 'TODOS';
  this.dateFromFilter = '';
  this.dateToFilter = '';
}

async exportFullExcelReport(): Promise<void> {
  const orders = this.filteredOrders();
  const users = this.users();
  const products = this.products();
  const now = new Date();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JONZKO SPORT';
  workbook.lastModifiedBy = 'Panel administrador JONZKO';
  workbook.created = now;
  workbook.modified = now;

  const colors = {
    black: 'FF0B0B0B',
    dark: 'FF1F2937',
    gold: 'FFC8A45D',
    softGold: 'FFFFF4D6',
    white: 'FFFFFFFF',
    gray: 'FFF3F4F6',
    lightGray: 'FFE5E7EB',
    green: 'FF16A34A',
    red: 'FFDC2626',
    blue: 'FF2563EB',
    orange: 'FFF97316'
  };

  const moneyFormat = '"S/ "#,##0.00';
  const numberFormat = '#,##0';

  const normalize = (value: any): string =>
    String(value || '').trim().toLowerCase();

  const isConfirmed = (order: OrderResponse): boolean => {
    const status = normalize(order.orderStatus);
    return status === 'confirmado' || status === 'entregado';
  };

  const isPending = (order: OrderResponse): boolean => {
    const status = normalize(order.orderStatus);
    return status === 'pendiente' || status === 'pendiente_confirmacion';
  };

  const isSent = (order: OrderResponse): boolean =>
    normalize(order.orderStatus) === 'enviado';

  const isCancelled = (order: OrderResponse): boolean =>
    normalize(order.orderStatus) === 'cancelado';

  const totalBruto = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const totalConfirmado = orders
    .filter(isConfirmed)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const totalPendiente = orders
    .filter(isPending)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const totalCancelado = orders
    .filter(isCancelled)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pedidosConfirmados = orders.filter(isConfirmed).length;
  const pedidosPendientes = orders.filter(isPending).length;
  const pedidosEnviados = orders.filter(isSent).length;
  const pedidosCancelados = orders.filter(isCancelled).length;

  const ticketPromedio =
    pedidosConfirmados > 0 ? totalConfirmado / pedidosConfirmados : 0;

  const subtotalConfirmado = totalConfirmado / 1.18;
  const igvConfirmado = totalConfirmado - subtotalConfirmado;

  const productosVendidos: any[] = [];

  orders.forEach(order => {
    this.parseItems(order).forEach(item => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || item.unitPrice || 0);
      const total = quantity * price;

      productosVendidos.push({
        idPedido: order.id,
        codigo: this.getOrderCode(order),
        cliente: order.customerName || '',
        correo: order.customerEmail || '',
        producto: item.productName || item.name || 'Producto',
        categoria: item.category || '',
        talla: item.selectedSize || item.size || '',
        color: item.selectedColor || item.color || '',
        cantidad: quantity,
        precio: price,
        total,
        metodoPago: order.paymentMethod || 'No registrado',
        estado: order.orderStatus || '',
        fecha: this.formatDate(order.createdAt),
        hora: this.formatTime(order.createdAt)
      });
    });
  });

  const productMap = new Map<string, { cantidad: number; total: number }>();

  productosVendidos.forEach(item => {
    const key = item.producto || 'Producto';
    const current = productMap.get(key) || { cantidad: 0, total: 0 };

    current.cantidad += Number(item.cantidad || 0);
    current.total += Number(item.total || 0);

    productMap.set(key, current);
  });

  const topProductos = Array.from(productMap.entries())
    .map(([producto, data]) => ({
      producto,
      cantidad: data.cantidad,
      total: data.total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const paymentMethods = Array.from(
    new Set(
      orders
        .map(order => order.paymentMethod || 'No registrado')
        .filter(method => method.trim() !== '')
    )
  );

  const metodosPago = paymentMethods.length > 0
    ? paymentMethods.map(method => {
        const filtered = orders.filter(
          order => normalize(order.paymentMethod) === normalize(method)
        );

        return {
          metodo: method,
          cantidad: filtered.length,
          total: filtered.reduce((sum, order) => sum + Number(order.total || 0), 0)
        };
      })
    : [
        {
          metodo: 'Sin pagos',
          cantidad: 0,
          total: 0
        }
      ];

  const ventasFechaMap = new Map<
    string,
    {
      pedidos: number;
      confirmados: number;
      pendientes: number;
      enviados: number;
      cancelados: number;
      total: number;
    }
  >();

  orders.forEach(order => {
    const fecha = this.formatDate(order.createdAt);
    const current =
      ventasFechaMap.get(fecha) || {
        pedidos: 0,
        confirmados: 0,
        pendientes: 0,
        enviados: 0,
        cancelados: 0,
        total: 0
      };

    current.pedidos += 1;
    current.total += Number(order.total || 0);

    if (isConfirmed(order)) current.confirmados += 1;
    if (isPending(order)) current.pendientes += 1;
    if (isSent(order)) current.enviados += 1;
    if (isCancelled(order)) current.cancelados += 1;

    ventasFechaMap.set(fecha, current);
  });

  const ventasPorFecha = Array.from(ventasFechaMap.entries()).map(
    ([fecha, data]) => ({
      fecha,
      pedidos: data.pedidos,
      confirmados: data.confirmados,
      pendientes: data.pendientes,
      enviados: data.enviados,
      cancelados: data.cancelados,
      total: data.total
    })
  );

  const setBorder = (cell: ExcelJS.Cell): void => {
    cell.border = {
      top: { style: 'thin', color: { argb: colors.lightGray } },
      left: { style: 'thin', color: { argb: colors.lightGray } },
      bottom: { style: 'thin', color: { argb: colors.lightGray } },
      right: { style: 'thin', color: { argb: colors.lightGray } }
    };
  };

  const styleTitle = (
    worksheet: ExcelJS.Worksheet,
    title: string,
    subtitle: string,
    lastColumn: number
  ): void => {
    worksheet.mergeCells(1, 1, 1, lastColumn);

    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = {
      bold: true,
      size: 20,
      color: { argb: colors.white }
    };
    titleCell.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.black }
    };

    worksheet.mergeCells(2, 1, 2, lastColumn);

    const subtitleCell = worksheet.getCell(2, 1);
    subtitleCell.value = subtitle;
    subtitleCell.font = {
      italic: true,
      size: 11,
      color: { argb: colors.dark }
    };
    subtitleCell.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    subtitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.softGold }
    };

    worksheet.getRow(1).height = 34;
    worksheet.getRow(2).height = 24;
  };

  const applyMoneyFormatToColumns = (
    worksheet: ExcelJS.Worksheet,
    headers: string[]
  ): void => {
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      const headerLower = normalize(header);

      if (
        headerLower.includes('total') ||
        headerLower.includes('precio') ||
        headerLower.includes('subtotal') ||
        headerLower.includes('igv') ||
        headerLower.includes('delivery') ||
        headerLower.includes('monto') ||
        headerLower.includes('venta') ||
        headerLower.includes('ticket')
      ) {
        column.numFmt = moneyFormat;
      }

      if (
        headerLower.includes('cantidad') ||
        headerLower.includes('stock') ||
        headerLower.includes('pedidos') ||
        headerLower.includes('confirmados') ||
        headerLower.includes('pendientes') ||
        headerLower.includes('cancelados') ||
        headerLower.includes('enviados')
      ) {
        column.numFmt = numberFormat;
      }
    });
  };

  const autoWidth = (
    worksheet: ExcelJS.Worksheet,
    headers: string[]
  ): void => {
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      let maxLength = header.length;

      column.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? String(cell.value) : '';
        maxLength = Math.max(maxLength, value.length);
      });

      column.width = Math.min(Math.max(maxLength + 3, 12), 38);
    });
  };

  const addTableSheet = (
    sheetName: string,
    title: string,
    headers: string[],
    rows: any[][]
  ): ExcelJS.Worksheet => {
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.views = [{ showGridLines: false, state: 'frozen', ySplit: 4 }];
    worksheet.properties.defaultRowHeight = 20;

    styleTitle(
      worksheet,
      title,
      `Generado el ${now.toLocaleString('es-PE')} | JONZKO SPORT`,
      headers.length
    );

    const headerRow = worksheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 28;

    headerRow.eachCell(cell => {
      cell.font = {
        bold: true,
        color: { argb: colors.white }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.dark }
      };
      setBorder(cell);
    });

    rows.forEach(row => {
      worksheet.addRow(row);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5) {
        row.eachCell(cell => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
          };
          setBorder(cell);
        });

        if (rowNumber % 2 === 0) {
          row.eachCell(cell => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFAFAFA' }
            };
          });
        }
      }
    });

    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: Math.max(4, rows.length + 4), column: headers.length }
    };

    applyMoneyFormatToColumns(worksheet, headers);
    autoWidth(worksheet, headers);

    return worksheet;
  };

  // ==========================
  // DASHBOARD EJECUTIVO
  // ==========================

  const dashboard = workbook.addWorksheet('Dashboard Ejecutivo');

  dashboard.views = [{ showGridLines: false }];
  dashboard.properties.defaultRowHeight = 22;

  dashboard.columns = [
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ];

  styleTitle(
    dashboard,
    'REPORTE EJECUTIVO CONTABLE - JONZKO SPORT',
    `Periodo filtrado desde el administrador | Generado: ${now.toLocaleString('es-PE')}`,
    8
  );

  const card = (
    row: number,
    col: number,
    title: string,
    value: number | string,
    format?: string,
    color: string = colors.black
  ): void => {
    dashboard.mergeCells(row, col, row, col + 1);

    const titleCell = dashboard.getCell(row, col);
    titleCell.value = title;
    titleCell.font = {
      bold: true,
      size: 10,
      color: { argb: colors.white }
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color }
    };

    dashboard.mergeCells(row + 1, col, row + 2, col + 1);

    const valueCell = dashboard.getCell(row + 1, col);
    valueCell.value = value;
    valueCell.font = {
      bold: true,
      size: 18,
      color: { argb: colors.black }
    };
    valueCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    valueCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.gray }
    };

    if (format) {
      valueCell.numFmt = format;
    }

    for (let r = row; r <= row + 2; r++) {
      for (let c = col; c <= col + 1; c++) {
        setBorder(dashboard.getCell(r, c));
      }
    }
  };

  card(5, 1, 'VENTAS CONFIRMADAS', totalConfirmado, moneyFormat, colors.green);
  card(5, 3, 'VENTAS BRUTAS', totalBruto, moneyFormat, colors.blue);
  card(5, 5, 'TICKET PROMEDIO', ticketPromedio, moneyFormat, colors.gold);
  card(5, 7, 'CLIENTES REGISTRADOS', users.length, numberFormat, colors.dark);

  card(9, 1, 'PEDIDOS ANALIZADOS', orders.length, numberFormat, colors.black);
  card(9, 3, 'PENDIENTES', pedidosPendientes, numberFormat, colors.orange);
  card(9, 5, 'CONFIRMADOS / ENTREGADOS', pedidosConfirmados, numberFormat, colors.green);
  card(9, 7, 'CANCELADOS', pedidosCancelados, numberFormat, colors.red);

  dashboard.mergeCells('A13:D13');
  dashboard.getCell('A13').value = 'Top productos vendidos';
  dashboard.getCell('A13').font = {
    bold: true,
    size: 14,
    color: { argb: colors.white }
  };
  dashboard.getCell('A13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.black }
  };
  dashboard.getCell('A13').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  dashboard.mergeCells('F13:H13');
  dashboard.getCell('F13').value = 'Métodos de pago';
  dashboard.getCell('F13').font = {
    bold: true,
    size: 14,
    color: { argb: colors.white }
  };
  dashboard.getCell('F13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.black }
  };
  dashboard.getCell('F13').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  const topHeaders = [
    { col: 1, text: 'Producto' },
    { col: 2, text: 'Cant.' },
    { col: 3, text: 'Total' },
    { col: 4, text: 'Gráfico' },
    { col: 6, text: 'Método' },
    { col: 7, text: 'Pedidos' },
    { col: 8, text: 'Total' }
  ];

  topHeaders.forEach(item => {
    const cell = dashboard.getCell(14, item.col);
    cell.value = item.text;
    cell.font = { bold: true, color: { argb: colors.white } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.dark }
    };
    setBorder(cell);
  });

  const maxProductQty = Math.max(...topProductos.map(p => p.cantidad), 1);

  if (topProductos.length === 0) {
    dashboard.getCell(15, 1).value = 'Sin productos vendidos';
    dashboard.getCell(15, 2).value = 0;
    dashboard.getCell(15, 3).value = 0;
    dashboard.getCell(15, 4).value = '';
    dashboard.getCell(15, 3).numFmt = moneyFormat;

    for (let col = 1; col <= 4; col++) {
      setBorder(dashboard.getCell(15, col));
    }
  }

  topProductos.forEach((item, index) => {
    const row = 15 + index;
    const barLength = Math.round((item.cantidad / maxProductQty) * 16);

    dashboard.getCell(row, 1).value = item.producto;
    dashboard.getCell(row, 2).value = item.cantidad;
    dashboard.getCell(row, 3).value = item.total;
    dashboard.getCell(row, 4).value = '█'.repeat(Math.max(barLength, 1));

    dashboard.getCell(row, 3).numFmt = moneyFormat;
    dashboard.getCell(row, 4).font = {
      bold: true,
      color: { argb: colors.gold }
    };

    for (let col = 1; col <= 4; col++) {
      setBorder(dashboard.getCell(row, col));
    }
  });

  metodosPago.forEach((item, index) => {
    const row = 15 + index;

    dashboard.getCell(row, 6).value = item.metodo;
    dashboard.getCell(row, 7).value = item.cantidad;
    dashboard.getCell(row, 8).value = item.total;
    dashboard.getCell(row, 8).numFmt = moneyFormat;

    for (let col = 6; col <= 8; col++) {
      setBorder(dashboard.getCell(row, col));
    }
  });

  dashboard.mergeCells('A28:H28');
  dashboard.getCell('A28').value = 'Ventas por fecha';
  dashboard.getCell('A28').font = {
    bold: true,
    size: 14,
    color: { argb: colors.white }
  };
  dashboard.getCell('A28').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colors.black }
  };
  dashboard.getCell('A28').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  const dateHeaders = [
    'Fecha',
    'Pedidos',
    'Confirmados',
    'Pendientes',
    'Enviados',
    'Cancelados',
    'Total vendido',
    'Gráfico'
  ];

  dateHeaders.forEach((header, index) => {
    const cell = dashboard.getCell(29, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: colors.white } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.dark }
    };
    setBorder(cell);
  });

  const maxDateTotal = Math.max(...ventasPorFecha.map(v => v.total), 1);

  if (ventasPorFecha.length === 0) {
    const row = 30;

    dashboard.getCell(row, 1).value = 'Sin ventas';
    dashboard.getCell(row, 2).value = 0;
    dashboard.getCell(row, 3).value = 0;
    dashboard.getCell(row, 4).value = 0;
    dashboard.getCell(row, 5).value = 0;
    dashboard.getCell(row, 6).value = 0;
    dashboard.getCell(row, 7).value = 0;
    dashboard.getCell(row, 8).value = '';

    dashboard.getCell(row, 7).numFmt = moneyFormat;

    for (let col = 1; col <= 8; col++) {
      setBorder(dashboard.getCell(row, col));
    }
  }

  ventasPorFecha.forEach((item, index) => {
    const row = 30 + index;
    const barLength = Math.round((item.total / maxDateTotal) * 24);

    dashboard.getCell(row, 1).value = item.fecha;
    dashboard.getCell(row, 2).value = item.pedidos;
    dashboard.getCell(row, 3).value = item.confirmados;
    dashboard.getCell(row, 4).value = item.pendientes;
    dashboard.getCell(row, 5).value = item.enviados;
    dashboard.getCell(row, 6).value = item.cancelados;
    dashboard.getCell(row, 7).value = item.total;
    dashboard.getCell(row, 8).value = '█'.repeat(Math.max(barLength, 1));

    dashboard.getCell(row, 7).numFmt = moneyFormat;
    dashboard.getCell(row, 8).font = {
      bold: true,
      color: { argb: colors.blue }
    };

    for (let col = 1; col <= 8; col++) {
      setBorder(dashboard.getCell(row, col));
    }
  });

  // ==========================
  // RESUMEN CONTABLE
  // ==========================

  const resumenRows = [
    ['Tienda', 'JONZKO SPORT'],
    ['Fecha de descarga', now.toLocaleString('es-PE')],
    ['Pedidos analizados', orders.length],
    ['Clientes registrados', users.length],
    ['Productos registrados', products.length],
    ['Productos activos', this.activeProducts()],
    ['Ventas brutas', totalBruto],
    ['Ventas confirmadas', totalConfirmado],
    ['Subtotal confirmado estimado', Number(subtotalConfirmado.toFixed(2))],
    ['IGV 18% estimado', Number(igvConfirmado.toFixed(2))],
    ['Monto pendiente por validar/cobrar', totalPendiente],
    ['Monto cancelado', totalCancelado],
    ['Ticket promedio confirmado', Number(ticketPromedio.toFixed(2))],
    ['Pedidos pendientes', pedidosPendientes],
    ['Pedidos confirmados/entregados', pedidosConfirmados],
    ['Pedidos enviados', pedidosEnviados],
    ['Pedidos cancelados', pedidosCancelados]
  ];

  const resumenSheet = addTableSheet(
    'Resumen Contable',
    'Resumen Contable',
    ['Métrica', 'Valor'],
    resumenRows
  );

  // ==========================
  // PEDIDOS DETALLE
  // ==========================

  const pedidosRows = orders.map(order => {
    const total = Number(order.total || 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    return [
      order.id,
      this.getOrderCode(order),
      order.customerName || '',
      order.customerEmail || '',
      order.customerPhone || '',
      order.documentType || 'Boleta',
      order.documentNumber || 'No registrado',
      order.department || '',
      order.province || '',
      order.district || '',
      order.address || '',
      order.referenceText || '',
      order.paymentMethod || '',
      order.orderStatus || '',
      this.getUserType(order),
      Number(subtotal.toFixed(2)),
      Number(igv.toFixed(2)),
      total,
      this.formatDate(order.createdAt),
      this.formatTime(order.createdAt),
      `${this.formatDate(order.updatedAt || order.createdAt)} ${this.formatTime(order.updatedAt || order.createdAt)}`
    ];
  });

  addTableSheet(
    'Pedidos Detalle',
    'Detalle de Pedidos',
    [
      'ID Pedido',
      'Código',
      'Cliente',
      'Correo',
      'Teléfono',
      'Tipo documento',
      'Número documento',
      'Departamento',
      'Provincia',
      'Distrito',
      'Dirección',
      'Referencia',
      'Método de pago',
      'Estado',
      'Tipo usuario',
      'Subtotal estimado',
      'IGV estimado',
      'Total',
      'Fecha',
      'Hora',
      'Última actualización'
    ],
    pedidosRows
  );

  // ==========================
  // PRODUCTOS VENDIDOS
  // ==========================

  addTableSheet(
    'Productos Vendidos',
    'Detalle de Productos Vendidos',
    [
      'ID Pedido',
      'Código',
      'Cliente',
      'Correo',
      'Producto',
      'Categoría',
      'Talla',
      'Color',
      'Cantidad',
      'Precio unitario',
      'Total producto',
      'Método de pago',
      'Estado pedido',
      'Fecha',
      'Hora'
    ],
    productosVendidos.map(item => [
      item.idPedido,
      item.codigo,
      item.cliente,
      item.correo,
      item.producto,
      item.categoria,
      item.talla,
      item.color,
      item.cantidad,
      item.precio,
      item.total,
      item.metodoPago,
      item.estado,
      item.fecha,
      item.hora
    ])
  );

  // ==========================
  // CLIENTES
  // ==========================

  addTableSheet(
    'Clientes',
    'Clientes Registrados',
    [
      'ID Cliente',
      'Nombre',
      'Correo',
      'Teléfono',
      'Estado',
      'Fecha registro'
    ],
    users.map(user => [
      user.id,
      user.fullName,
      user.email,
      user.phone,
      user.active ? 'Activo' : 'Inactivo',
      user.createdAt || 'Sin fecha'
    ])
  );

  // ==========================
  // CATÁLOGO
  // ==========================

  addTableSheet(
    'Catálogo',
    'Catálogo de Productos',
    [
      'ID Producto',
      'Nombre',
      'Categoría',
      'Descripción',
      'Precio actual',
      'Precio anterior',
      'Color',
      'Tallas',
      'Stock',
      'Tipo de venta',
      'Imagen principal',
      'Imagen 2',
      'Imagen 3',
      'Video',
      'Activo',
      'Fecha creación',
      'Última actualización'
    ],
    products.map(product => [
      product.id,
      product.name,
      product.category,
      product.description || '',
      product.price,
      product.oldPrice || '',
      product.color || '',
      product.sizes || '',
      product.stock,
      product.saleType || '',
      product.imageUrl,
      product.imageUrl2 || '',
      product.imageUrl3 || '',
      product.videoUrl || '',
      product.active ? 'Sí' : 'No',
      product.createdAt || '',
      product.updatedAt || ''
    ])
  );

  // ==========================
  // MÉTODOS DE PAGO
  // ==========================

  addTableSheet(
    'Métodos de Pago',
    'Arqueo por Método de Pago',
    [
      'Método de pago',
      'Cantidad pedidos',
      'Total vendido'
    ],
    metodosPago.map(item => [
      item.metodo,
      item.cantidad,
      item.total
    ])
  );

  // ==========================
  // VENTAS POR FECHA
  // ==========================

  addTableSheet(
    'Ventas por Fecha',
    'Pedidos y Ventas por Fecha',
    [
      'Fecha',
      'Pedidos',
      'Confirmados',
      'Pendientes',
      'Enviados',
      'Cancelados',
      'Total vendido'
    ],
    ventasPorFecha.map(item => [
      item.fecha,
      item.pedidos,
      item.confirmados,
      item.pendientes,
      item.enviados,
      item.cancelados,
      item.total
    ])
  );

  // ==========================
  // TOP PRODUCTOS
  // ==========================

  addTableSheet(
    'Top Productos',
    'Ranking de Productos Vendidos',
    [
      'Producto',
      'Cantidad vendida',
      'Total vendido'
    ],
    topProductos.map(item => [
      item.producto,
      item.cantidad,
      item.total
    ])
  );

  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 16000,
      height: 9000,
      firstSheet: 0,
      activeTab: 0,
      visibility: 'visible'
    }
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(blob, `Reporte_JONZKO_PRO_${now.getTime()}.xlsx`);
}

viewVoucher(order: OrderResponse): void {
  this.currentReceiptOrder = order;
  this.currentReceiptType = 'Voucher';

  const content = this.buildReceiptHtml(order, 'Voucher');
  this.openReceiptModal(`Voucher del pedido #${order.id}`, content);
}

viewSaleReceipt(
  order: OrderResponse,
  type: 'Boleta' | 'Factura' | 'Comprobante'
): void {
  this.currentReceiptOrder = order;
  this.currentReceiptType = type;

  const content = this.buildReceiptHtml(order, type);
  this.openReceiptModal(`${type} del pedido #${order.id}`, content);
}

viewCurrentReceipt(order: OrderResponse): void {
  const orderChanged =
    !this.currentReceiptOrder || this.currentReceiptOrder.id !== order.id;

  if (orderChanged) {
    this.currentReceiptOrder = order;

    if ((order.documentType || '').toLowerCase().includes('factura')) {
      this.currentReceiptType = 'Factura';
    } else if ((order.documentType || '').toLowerCase().includes('boleta')) {
      this.currentReceiptType = 'Boleta';
    } else {
      this.currentReceiptType = 'Comprobante';
    }
  }

  const content = this.buildReceiptHtml(order, this.currentReceiptType);
  this.openReceiptModal(`${this.currentReceiptType} del pedido #${order.id}`, content);
}

downloadCurrentReceipt(order: OrderResponse): void {
  const orderChanged =
    !this.currentReceiptOrder || this.currentReceiptOrder.id !== order.id;

  if (orderChanged) {
    this.currentReceiptOrder = order;

    if ((order.documentType || '').toLowerCase().includes('factura')) {
      this.currentReceiptType = 'Factura';
    } else if ((order.documentType || '').toLowerCase().includes('boleta')) {
      this.currentReceiptType = 'Boleta';
    } else {
      this.currentReceiptType = 'Comprobante';
    }
  }

  this.downloadOrderPdf(order, this.currentReceiptType);
}

async downloadOrderPdf(
  order: OrderResponse,
  type: 'Voucher' | 'Boleta' | 'Factura' | 'Comprobante'
): Promise<void> {
  try {
    const tempContainer = document.createElement('div');

    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-10000px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1100px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.zIndex = '-1';

    tempContainer.innerHTML = this.buildReceiptHtml(order, type);
    document.body.appendChild(tempContainer);

    const receiptPage = tempContainer.querySelector('.receipt-page') as HTMLElement;

    if (!receiptPage) {
      document.body.removeChild(tempContainer);
      alert('No se pudo generar el comprobante para PDF.');
      return;
    }

    const canvas = await html2canvas(receiptPage, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = `${type}_JONZKO_Pedido_${order.id}.pdf`;

    pdf.save(fileName);

    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error generando PDF bonito:', error);
    alert('No se pudo descargar el PDF.');
  }
}

private openPrintWindow(title: string, content: string): void {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('No se pudo abrir la ventana del comprobante.');
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 28px;
            font-family: Arial, Helvetica, sans-serif;
            background: #eef2f7;
            color: #0f172a;
          }

          .receipt-page {
            max-width: 980px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #d9e1ea;
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
          }

          .receipt-top {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            padding-bottom: 18px;
            border-bottom: 1px solid #dde5ee;
            margin-bottom: 24px;
          }

          .brand-box {
            display: flex;
            gap: 18px;
            align-items: flex-start;
            flex: 1;
          }

          .brand-logo {
            width: 78px;
            height: 78px;
            object-fit: cover;
            border-radius: 16px;
            border: 1px solid #d9e1ea;
          }

          .brand-box h1 {
            margin: 0 0 8px;
            font-size: 34px;
            line-height: 1.1;
            color: #0b1736;
          }

          .brand-box p {
            margin: 4px 0;
            font-size: 14px;
            color: #334155;
          }

          .doc-box {
            min-width: 280px;
            border: 2px solid #0b1736;
            border-radius: 18px;
            padding: 20px;
            text-align: center;
          }

          .doc-box h2 {
            margin: 0;
            font-size: 22px;
            color: #0b1736;
          }

          .doc-box h3 {
            margin: 10px 0;
            font-size: 18px;
            color: #0b1736;
          }

          .doc-box p {
            margin: 0;
            font-size: 14px;
          }

          .section-card {
            border: 1px solid #d9e1ea;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 18px;
          }

          .section-card h3 {
            margin: 0 0 16px;
            font-size: 18px;
            color: #0b1736;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px 24px;
          }

          .info-grid div span {
            display: block;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 4px;
          }

          .info-grid div strong {
            font-size: 18px;
            color: #0f172a;
          }

          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }

          .receipt-table th,
          .receipt-table td {
            border: 1px solid #d9e1ea;
            padding: 10px 12px;
            font-size: 13px;
            text-align: left;
          }

          .receipt-table th {
            background: #f8fafc;
            color: #0b1736;
          }

          .detail-lines {
            display: grid;
            gap: 12px;
          }

          .line-item {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: center;
            border: 1px solid #d9e1ea;
            border-radius: 14px;
            padding: 12px 14px;
            background: #f8fafc;
          }

          .line-item p {
            margin: 6px 0 0;
            font-size: 13px;
            color: #475569;
          }

          .summary-wrap {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }

          .summary-box {
            width: 320px;
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid #d9e1ea;
          }

          .summary-box div {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: #ffffff;
            border-bottom: 1px solid #d9e1ea;
            font-size: 16px;
          }

          .summary-box div:last-child {
            border-bottom: none;
          }

          .summary-total {
            background: #0b1736 !important;
            color: #ffffff;
            font-size: 22px !important;
            font-weight: 700;
          }

          .summary-total strong,
          .summary-total span {
            color: #ffffff;
          }

          .totals-box {
            margin-top: 18px;
            border: 1px solid #d9e1ea;
            border-radius: 18px;
            overflow: hidden;
          }

          .totals-box div {
            display: flex;
            justify-content: space-between;
            padding: 16px 20px;
            background: #0b1736;
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
          }

          .receipt-footer {
            text-align: center;
            font-size: 13px;
            color: #64748b;
            margin-top: 26px;
          }

          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }

            .receipt-page {
              box-shadow: none;
              border: none;
              border-radius: 0;
              max-width: 100%;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
openReceiptModal(title: string, content: string): void {
  this.receiptModalTitle = title;
  this.receiptModalContent = content;
  this.receiptModalOpen = true;
}

closeReceiptModal(): void {
  this.receiptModalOpen = false;
  this.receiptModalTitle = '';
  this.receiptModalContent = '';
}

getOrderCode(order: OrderResponse): string {
  return (order as any).orderCode || 'Pedido';
}

getSubtotal(order: OrderResponse): number {
  return Number((order as any).subtotal || Number(order.total || 0) / 1.18);
}

getDeliveryCost(order: OrderResponse): number {
  return Number((order as any).deliveryCost || 0);
}

getUserType(order: OrderResponse): string {
  return (order as any).userType || 'Cliente';
}

getOperationCode(order: OrderResponse): string {
  return (order as any).operationCode || (order as any).paymentOperation || 'No registrado';
}
private receiptStyle(): string {
  return `
    <style>
      .receipt-page {
        max-width: 980px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 24px;
        padding: 34px;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        box-shadow: 0 18px 50px rgba(0,0,0,.12);
      }

      .receipt-top {
        display: grid;
        grid-template-columns: 1fr 310px;
        gap: 28px;
        align-items: start;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 24px;
        margin-bottom: 24px;
      }

      .brand-box {
        display: flex;
        gap: 18px;
        align-items: flex-start;
      }

      .brand-logo {
        width: 82px;
        height: 82px;
        border-radius: 18px;
        object-fit: cover;
        border: 1px solid #e5e7eb;
        background: #fff;
      }

      .brand-box h1 {
        margin: 0 0 8px;
        font-size: 34px;
        letter-spacing: 2px;
        color: #050505;
      }

      .brand-box p {
        margin: 5px 0;
        font-size: 14px;
        color: #374151;
      }

      .doc-box {
        border: 2px solid #050505;
        border-radius: 20px;
        padding: 22px 18px;
        text-align: center;
        background: #fbfbfb;
      }

      .doc-box .ruc {
        font-size: 14px;
        font-weight: 800;
        margin-bottom: 10px;
      }

      .doc-box h2 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 1px;
      }

      .doc-box h3 {
        margin: 12px 0 0;
        font-size: 18px;
      }

      .doc-box p {
        margin: 12px 0 0;
        font-size: 13px;
        color: #374151;
      }

      .section-card {
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 20px;
        margin-bottom: 18px;
        background: #ffffff;
      }

      .section-card h3 {
        margin: 0 0 16px;
        font-size: 18px;
        color: #111827;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px 28px;
      }

      .info-grid span {
        display: block;
        font-size: 12px;
        color: #6b7280;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .info-grid strong {
        display: block;
        font-size: 16px;
        color: #111827;
      }

      .receipt-table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 14px;
      }

      .receipt-table th {
        background: #050505;
        color: #ffffff;
        padding: 12px;
        font-size: 13px;
        text-align: left;
      }

      .receipt-table td {
        border-bottom: 1px solid #e5e7eb;
        padding: 12px;
        font-size: 13px;
      }

      .receipt-table tr:last-child td {
        border-bottom: none;
      }

      .text-right {
        text-align: right;
      }

      .summary-wrap {
        display: flex;
        justify-content: flex-end;
        margin-top: 18px;
      }

      .summary-box {
        width: 340px;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        overflow: hidden;
      }

      .summary-box div {
        display: flex;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid #e5e7eb;
        background: #ffffff;
      }

      .summary-box div:last-child {
        border-bottom: none;
      }

      .summary-total {
        background: #050505 !important;
        color: #ffffff;
        font-size: 22px;
        font-weight: 900;
      }

      .voucher-status {
        display: inline-block;
        background: #dcfce7;
        color: #166534;
        padding: 8px 14px;
        border-radius: 999px;
        font-weight: 900;
        font-size: 12px;
        text-transform: uppercase;
      }

      .receipt-footer {
        margin-top: 28px;
        text-align: center;
        color: #6b7280;
        font-size: 13px;
        border-top: 1px solid #e5e7eb;
        padding-top: 18px;
      }

      @media print {
        body {
          background: #fff;
        }

        .receipt-page {
          box-shadow: none;
          border-radius: 0;
          padding: 0;
        }
      }
    </style>
  `;
}

private buildReceiptHtml(
  order: OrderResponse,
  type: 'Voucher' | 'Boleta' | 'Factura' | 'Comprobante'
): string {
  const items = this.parseItems(order);
  const subtotal = this.getSubtotal(order);
  const delivery = this.getDeliveryCost(order);
  const igv = Number(order.total || 0) - subtotal - delivery;
  const total = Number(order.total || 0);

  const documentNumber =
    order.documentNumber || order.customerPhone || `000000${order.id}`;

  const serie =
    type === 'Factura'
      ? `F001-${documentNumber}`
      : type === 'Boleta'
        ? `B001-${documentNumber}`
        : type === 'Voucher'
          ? `V001-${documentNumber}`
          : `C001-${documentNumber}`;

  const title =
    type === 'Voucher'
      ? 'VOUCHER / COMPROBANTE DE PAGO'
      : type.toUpperCase();

  const rows = items.map((item, index) => {
    const name = item.productName || item.name || 'Producto';
    const size = item.selectedSize || '-';
    const color = item.selectedColor || '-';
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = quantity * price;

    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${name}</strong></td>
        <td>${size}</td>
        <td>${color}</td>
        <td class="text-right">${quantity}</td>
        <td class="text-right">S/ ${price.toFixed(2)}</td>
        <td class="text-right"><strong>S/ ${lineTotal.toFixed(2)}</strong></td>
      </tr>
    `;
  }).join('');

  return `
    ${this.receiptStyle()}

    <div class="receipt-page">
      <div class="receipt-top">
        <div class="brand-box">
          <img class="brand-logo" src="${this.companyLogo}" alt="JONZKO SPORT">
          <div>
            <h1>${this.companyName}</h1>
            <p><strong>RUC:</strong> ${this.companyRuc}</p>
            <p><strong>Dirección fiscal:</strong> ${this.companyAddress}</p>
            <p><strong>Correo:</strong> ${this.companyEmail}</p>
            <p><strong>Venta:</strong> Online</p>
          </div>
        </div>

        <div class="doc-box">
          <div class="ruc">RUC ${this.companyRuc}</div>
          <h2>${title}</h2>
          <h3>${serie}</h3>
          <p>Fecha: ${this.formatDate(order.createdAt)} ${this.formatTime(order.createdAt)}</p>
        </div>
      </div>

      <div class="section-card">
        <h3>Datos del cliente</h3>
        <div class="info-grid">
          <div>
            <span>Cliente</span>
            <strong>${order.customerName || 'No registrado'}</strong>
          </div>
          <div>
            <span>Documento</span>
            <strong>${order.documentType || 'Boleta'} ${documentNumber}</strong>
          </div>
          <div>
            <span>Correo</span>
            <strong>${order.customerEmail || 'No registrado'}</strong>
          </div>
          <div>
            <span>Teléfono</span>
            <strong>${order.customerPhone || 'No registrado'}</strong>
          </div>
          <div>
            <span>Ubicación</span>
            <strong>${order.department || ''} / ${order.province || ''} / ${order.district || ''}</strong>
          </div>
          <div>
            <span>Referencia</span>
            <strong>${order.referenceText || 'Sin referencia'}</strong>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h3>Datos del pago</h3>
        <div class="info-grid">
          <div>
            <span>Pedido</span>
            <strong>${this.getOrderCode(order)}</strong>
          </div>
          <div>
            <span>Método de pago</span>
            <strong>${order.paymentMethod || 'No registrado'}</strong>
          </div>
          <div>
            <span>Operación</span>
            <strong>${this.getOperationCode(order)}</strong>
          </div>
          <div>
            <span>Estado</span>
            <strong><span class="voucher-status">${order.orderStatus || 'Sin estado'}</span></strong>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h3>Detalle de productos vendidos</h3>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Talla</th>
              <th>Color</th>
              <th class="text-right">Cant.</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `
              <tr>
                <td colspan="7">No hay productos registrados.</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="summary-wrap">
          <div class="summary-box">
            <div>
              <span>Subtotal</span>
              <strong>S/ ${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>S/ ${delivery.toFixed(2)}</strong>
            </div>
            <div>
              <span>IGV 18%</span>
              <strong>S/ ${igv.toFixed(2)}</strong>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <strong>S/ ${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="receipt-footer">
        Documento generado desde el panel administrativo de JONZKO SPORT.
        <br>
        Esta venta fue registrada como venta online.
      </div>
    </div>
  `;
}
}