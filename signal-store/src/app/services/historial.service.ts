import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private baseUrl = `${environment.baseUrl}/historial-cambios-vip`;

  constructor(private http: HttpClient) {}

  obtenerHistorial(mes: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/?mes=${mes}`);
  }
}
