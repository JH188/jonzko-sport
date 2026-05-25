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
  private apiUrl = 'http://localhost:8080/api/customer-orders';

  constructor(private http: HttpClient) {}

  createOrder(data: CustomerOrderRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getOrdersByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
}