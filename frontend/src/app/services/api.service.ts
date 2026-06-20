import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================
// PRODUCTOS
// ==========================
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;

  oldPrice?: number;
  color?: string;
  sizes?: string;
  saleType?: string;
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
// VARIANTES DE PRODUCTO
// Tallas, colores, precio y stock por producto
// ==========================
export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
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

  // JWT del usuario normal
  token?: string;
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
  private readonly apiUrl = 'https://jonzko-sport-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  private getUserHeaders(): { headers: HttpHeaders } {
  const token =
    localStorage.getItem('jonzko_user_token') ||
    localStorage.getItem('token') ||
    '';

  return {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  };
}
  private getAdminHeaders(): { headers: HttpHeaders } {
  const token = localStorage.getItem('jonzko_admin_token') || '';

  return {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  };
}

  // ==========================
  // PRODUCTOS PARA TIENDA
  // Solo productos activos
  // GET: https://jonzko-sport-production.up.railway.app/api/products
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
  return this.http.get<Product[]>(
    `${this.apiUrl}/products/admin/all`,
    this.getAdminHeaders()
  );
}

createProduct(data: ProductRequest): Observable<Product> {
  return this.http.post<Product>(
    `${this.apiUrl}/products/admin`,
    data,
    this.getAdminHeaders()
  );
}

updateProduct(productId: number, data: ProductRequest): Observable<Product> {
  return this.http.put<Product>(
    `${this.apiUrl}/products/admin/${productId}`,
    data,
    this.getAdminHeaders()
  );
}

deleteProduct(productId: number): Observable<any> {
  return this.http.delete<any>(
    `${this.apiUrl}/products/admin/${productId}`,
    this.getAdminHeaders()
  );
}
uploadProductImage(formData: FormData): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/products/admin/upload-image`,
    formData,
    this.getAdminHeaders()
  );
}
  // ==========================
  // VARIANTES DE PRODUCTO PARA ADMIN
  // Tallas, colores, stock y precio por producto
  // ==========================
getAdminProductVariants(): Observable<ProductVariant[]> {
  return this.http.get<ProductVariant[]>(
    `${this.apiUrl}/admin/product-variants`,
    this.getAdminHeaders()
  );
}

getAdminProductVariantsByProduct(productId: number): Observable<ProductVariant[]> {
  return this.http.get<ProductVariant[]>(
    `${this.apiUrl}/admin/product-variants/product/${productId}`,
    this.getAdminHeaders()
  );
}

updateAdminProductVariant(
  variantId: number,
  data: ProductVariant
): Observable<ProductVariant> {
  return this.http.put<ProductVariant>(
    `${this.apiUrl}/admin/product-variants/${variantId}`,
    data,
    this.getAdminHeaders()
  );
}

updateAdminProductVariantStock(
  variantId: number,
  stock: number
): Observable<ProductVariant> {
  return this.http.put<ProductVariant>(
    `${this.apiUrl}/admin/product-variants/${variantId}/stock?stock=${stock}`,
    {},
    this.getAdminHeaders()
  );
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

  // ==========================
// USUARIOS PARA ADMIN
// GET: https://jonzko-sport-production.up.railway.app/api/admin/users
// ==========================
getUsers(): Observable<UserResponse[]> {
  return this.http.get<UserResponse[]>(
    `${this.apiUrl}/admin/users`,
    this.getAdminHeaders()
  );
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
getOrdersByUser(userId: number): Observable<OrderResponse[]> {
  return this.http.get<OrderResponse[]>(
    `${this.apiUrl}/customer-orders/user/${userId}`,
    this.getUserHeaders()
  );
}

// ==========================
// PEDIDOS PARA ADMIN
// GET: http://localhost:8080/api/admin/orders
// ==========================
getAdminOrders(): Observable<OrderResponse[]> {
  return this.http.get<OrderResponse[]>(
    `${this.apiUrl}/admin/orders`,
    this.getAdminHeaders()
  );
}
// ==========================
// CAMBIAR ESTADO DEL PEDIDO DESDE ADMIN
// PUT: http://localhost:8080/api/admin/orders/1/status
// ==========================
updateOrderStatus(orderId: number, orderStatus: string): Observable<OrderResponse> {
  return this.http.put<OrderResponse>(
    `${this.apiUrl}/admin/orders/${orderId}/status`,
    { orderStatus },
    this.getAdminHeaders()
  );
}

updatePaymentStatus(orderId: number, paymentStatus: string): Observable<OrderResponse> {
  return this.http.put<OrderResponse>(
    `${this.apiUrl}/orders/${orderId}/payment-status`,
    { paymentStatus },
    this.getAdminHeaders()
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
  return this.http.put<SiteSetting>(
    `${this.apiUrl}/settings`,
    data,
    this.getAdminHeaders()
  );
}
}