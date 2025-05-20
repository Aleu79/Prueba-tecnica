import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Descuento {
    fecha_especial: string;
    descuento: number | null; 
    descripcion?: string;
}
  

@Injectable({
  providedIn: 'root'
})
export class DescuentoService {
  private baseUrl = `${environment.baseUrl}/descuentos`;

  constructor(private http: HttpClient) {}

  crearDescuento(descuento: Descuento): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/', descuento);
  }
}
