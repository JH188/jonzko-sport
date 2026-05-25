import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================
// PRODUCTOS
// ==========================
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;

  // Precio actual/oferta
  price: number;

  // Precio anterior, ejemplo: 65.00
  oldPrice?: number;

  // Datos de ropa
  color?: string;
  sizes?: string;

  // Catálogo por pedido / stock real
  stock: number;
  saleType?: string;

  imageUrl: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  category: string;
  description: string;

  price: number;
  oldPrice?: number;

  color?: string;
  sizes?: string;

  stock: number;
  saleType?: string;

  imageUrl: string;
  active: boolean;
}

// ==========================
// USUARIOS
// ==========================
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt?: string;
}

// ==========================
// PEDIDOS
// ==========================
export interface OrderItemRequest {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  department: string;
  province: string;
  district: string;
  address: string;
  referenceText: string;
  subtotal: number;
  deliveryCost: number;
  total: number;
  paymentMethod: string;
  userType: string;
  items: OrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  userId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  documentType?: string;
  documentNumber?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
  referenceText?: string;
  paymentMethod?: string;
  operationCode?: string;
  orderStatus?: string;
  total: number;
  itemsJson?: string;
  items?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// ==========================
// PERSONALIZACIÓN WEB
// ==========================
export interface SiteSetting {
  id?: number;

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
  whatsappMessage: string;

  collectionTitle: string;
  collectionDescription: string;
  contactTitle: string;
  contactDescription: string;

  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SiteSettingRequest = Omit<
  SiteSetting,
  'id' | 'active' | 'createdAt' | 'updatedAt'
>;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ==========================
  // PRODUCTOS PARA TIENDA
  // Solo productos activos
  // GET: http://localhost:8080/api/products
  // ==========================
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }
  getProductById(productId: number): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/products/${productId}`);
}

  // ==========================
  // PRODUCTOS PARA ADMIN
  // Todos los productos: activos e inactivos
  // GET: http://localhost:8080/api/products/admin/all
  // ==========================
  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/admin/all`);
  }

  // ==========================
  // CREAR PRODUCTO
  // POST: http://localhost:8080/api/products/admin
  // ==========================
  createProduct(data: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/admin`, data);
  }

  // ==========================
  // ACTUALIZAR PRODUCTO
  // PUT: http://localhost:8080/api/products/admin/1
  // ==========================
  updateProduct(productId: number, data: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/admin/${productId}`, data);
  }

  // ==========================
  // ELIMINAR PRODUCTO
  // DELETE: http://localhost:8080/api/products/admin/1
  // ==========================
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/admin/${productId}`);
  }

  // ==========================
  // USUARIOS
  // ==========================
  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/users/register`, data);
  }

  login(data: LoginRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/users/login`, data);
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }

  // ==========================
  // PEDIDOS
  // ==========================
  createOrder(data: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, data);
  }

getOrders(): Observable<OrderResponse[]> {
  return this.http.get<OrderResponse[]>(`${this.apiUrl}/orders`);
}

// ==========================
// PEDIDOS PARA ADMIN
// GET: http://localhost:8080/api/admin/orders
// ==========================
getAdminOrders(): Observable<OrderResponse[]> {
  return this.http.get<OrderResponse[]>(`${this.apiUrl}/admin/orders`);
}

// ==========================
// CAMBIAR ESTADO DEL PEDIDO DESDE ADMIN
// PUT: http://localhost:8080/api/admin/orders/1/status
// ==========================
updateOrderStatus(orderId: number, orderStatus: string): Observable<OrderResponse> {
  return this.http.put<OrderResponse>(
    `${this.apiUrl}/admin/orders/${orderId}/status`,
    { orderStatus }
  );
}

updatePaymentStatus(orderId: number, paymentStatus: string): Observable<OrderResponse> {
  return this.http.put<OrderResponse>(
    `${this.apiUrl}/orders/${orderId}/payment-status`,
    { paymentStatus }
  );
}

  // ==========================
  // PERSONALIZACIÓN WEB
  // GET: http://localhost:8080/api/settings
  // PUT: http://localhost:8080/api/settings
  // ==========================
  getSettings(): Observable<SiteSetting> {
    return this.http.get<SiteSetting>(`${this.apiUrl}/settings`);
  }

  updateSettings(data: SiteSettingRequest): Observable<SiteSetting> {
    return this.http.put<SiteSetting>(`${this.apiUrl}/settings`, data);
  }
}