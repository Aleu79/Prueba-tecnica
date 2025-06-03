import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Cliente } from '../shared/interfaces/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = `${environment.baseUrl}/clientes`;

  constructor(private http: HttpClient) {}

  obtenerClientesVIP(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/vip/`);
  }

  obtenerClientesNoVIP(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/normal/`);
  }
}
