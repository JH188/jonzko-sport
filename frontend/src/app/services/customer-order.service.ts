import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomerOrderRequest {
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  documentType: string;
  documentNumber: string;

  department: string;
  province: string;
  district: string;
  address: string;
  referenceText: string;

  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;

  total: number;
  itemsJson: string;

  mercadoPagoPaymentId?: string;
  mercadoPagoStatus?: string;
  mercadoPagoStatusDetail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerOrderService {
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

  createOrder(data: CustomerOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customer-orders`, data);
  }

  getOrdersByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/customer-orders/user/${userId}`,
      this.getUserHeaders()
    );
  }

  getAdminOrders(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/admin/orders`,
      this.getAdminHeaders()
    );
  }

  updateOrderStatus(orderId: number, orderStatus: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/admin/orders/${orderId}/status`,
      { orderStatus },
      this.getAdminHeaders()
    );
  }
}