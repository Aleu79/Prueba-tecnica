import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginCredentials } from '../shared/interfaces/login-credentials';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl + '/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginCredentials ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res) => {
        console.log('Respuesta del login:', res);

        if (res.token) localStorage.setItem('token', res.token);
        if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        if (res.rol) {
          localStorage.setItem('rol', res.rol);
          console.log('Rol del usuario:', res.rol);

          // Redirección según el rol
          if (res.rol === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }
      })
    );
  }

  logout(): void {
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    localStorage.removeItem('product');

    // Redirigir a la pantalla de login
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
}
