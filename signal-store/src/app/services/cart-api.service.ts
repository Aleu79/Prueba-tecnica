import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductItemCart } from '../shared/interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartApiService {
  private apiUrl = `${environment.baseUrl}/api/cart/`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  enviarCarrito(products: ProductItemCart[]): Observable<any> {
    const body = products.map((item) => ({
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity
    }));
    return this.http.post(this.apiUrl, { products: body }, {
      headers: this.getAuthHeaders()
    });
  }

  finalizarCompra(products: ProductItemCart[]): Observable<any> {
    const body = {
      products: products.map((item) => ({
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity
      })),
      compra_finalizada: true
    };
    return this.http.post(this.apiUrl, body, {
      headers: this.getAuthHeaders()
    });
  }
}
