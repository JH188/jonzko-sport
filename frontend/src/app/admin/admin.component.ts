import { Component, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



import {
  ApiService,
  Product,
  ProductRequest,
  OrderResponse,
  UserResponse
} from '../services/api.service';

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
    stock: 0,
    imageUrl: '',
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
  stock: Number(this.productForm.stock),
  imageUrl: (this.productForm.imageUrl || '').trim(),
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
      stock: Number(product.stock),
      imageUrl: product.imageUrl,
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

  resetProductForm(): void {
    this.editingProductId.set(null);

    this.productForm = {
      name: '',
      category: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      active: true
    };
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

exportFullExcelReport(): void {
  const orders = this.filteredOrders();
  const users = this.users();
  const products = this.products();

  const resumen = [
    {
      'Tienda': 'JONZKO SPORT',
      'Fecha de descarga': new Date().toLocaleString('es-PE'),
      'Pedidos analizados': orders.length,
      'Clientes registrados': users.length,
      'Productos registrados': products.length,
      'Productos activos': this.activeProducts(),
      'Ingresos confirmados': this.totalRevenue(),
      'Pendientes': this.pendingAdminOrders(),
      'Confirmados': this.confirmedOrders(),
      'Enviados': this.sentOrders(),
      'Cancelados': this.cancelledOrders()
    }
  ];

  const pedidos = orders.map(order => {
    const subtotal = Number(order.total || 0) / 1.18;
    const igv = Number(order.total || 0) - subtotal;

    return {
      'ID Pedido': order.id,
      'Código': this.getOrderCode(order),
      'Cliente': order.customerName,
      'Correo': order.customerEmail,
      'Teléfono': order.customerPhone,
      'Tipo documento': order.documentType || 'Boleta',
      'Número documento': order.documentNumber || 'No registrado',
      'Departamento': order.department,
      'Provincia': order.province,
      'Distrito': order.district,
      'Dirección': order.address,
      'Referencia': order.referenceText,
      'Método de pago': order.paymentMethod,
      'Estado': order.orderStatus,
      'Tipo usuario': this.getUserType(order),
      'Subtotal estimado': Number(subtotal.toFixed(2)),
      'IGV estimado': Number(igv.toFixed(2)),
      'Total': Number(order.total || 0),
      'Fecha': this.formatDate(order.createdAt),
      'Hora': this.formatTime(order.createdAt),
      'Última actualización': `${this.formatDate(order.updatedAt || order.createdAt)} ${this.formatTime(order.updatedAt || order.createdAt)}`
    };
  });

  const productosVendidos: any[] = [];

  orders.forEach(order => {
    this.parseItems(order).forEach(item => {
      productosVendidos.push({
        'ID Pedido': order.id,
        'Cliente': order.customerName,
        'Correo': order.customerEmail,
        'Producto': item.productName || item.name || 'Producto',
        'Categoría': item.category || '',
        'Talla': item.selectedSize || '',
        'Color': item.selectedColor || '',
        'Cantidad': item.quantity || 1,
        'Precio unitario': Number(item.price || 0),
        'Total producto': Number(item.price || 0) * Number(item.quantity || 1),
        'Método de pago': order.paymentMethod,
        'Estado pedido': order.orderStatus,
        'Fecha': this.formatDate(order.createdAt),
        'Hora': this.formatTime(order.createdAt)
      });
    });
  });

  const clientes = users.map(user => ({
    'ID Cliente': user.id,
    'Nombre': user.fullName,
    'Correo': user.email,
    'Teléfono': user.phone,
    'Estado': user.active ? 'Activo' : 'Inactivo',
    'Fecha registro': user.createdAt || 'Sin fecha'
  }));

  const catalogo = products.map(product => ({
    'ID Producto': product.id,
    'Nombre': product.name,
    'Categoría': product.category,
    'Descripción': product.description,
    'Precio actual': product.price,
    'Precio anterior': product.oldPrice || '',
    'Color': product.color || '',
    'Tallas': product.sizes || '',
    'Stock': product.stock,
    'Tipo de venta': product.saleType || '',
    'Imagen': product.imageUrl,
    'Activo': product.active ? 'Sí' : 'No',
    'Fecha creación': product.createdAt || '',
    'Última actualización': product.updatedAt || ''
  }));

  const metodosPago = ['Yape', 'Plin', 'Transferencia'].map(method => {
    const filtered = orders.filter(order => (order.paymentMethod || '').toLowerCase() === method.toLowerCase());

    return {
      'Método de pago': method,
      'Cantidad pedidos': filtered.length,
      'Total vendido': filtered.reduce((sum, order) => sum + Number(order.total || 0), 0)
    };
  });

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumen), 'Resumen');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(pedidos), 'Pedidos');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productosVendidos), 'Productos vendidos');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clientes), 'Clientes');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(catalogo), 'Catálogo');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(metodosPago), 'Métodos de pago');

  XLSX.writeFile(workbook, `Reporte_JONZKO_${new Date().getTime()}.xlsx`);
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