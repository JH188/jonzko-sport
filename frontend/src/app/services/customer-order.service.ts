import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  total: number;
  itemsJson: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerOrderService {
  private readonly apiUrl = 'https://jonzko-sport-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  createOrder(data: CustomerOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, data);
  }

  getOrdersByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/user/${userId}`);
  }

  getAdminOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders`);
  }

  updateOrderStatus(orderId: number, orderStatus: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/admin/orders/${orderId}/status`,
      { orderStatus }
    );
  }
}