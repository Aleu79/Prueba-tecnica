import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Rutas públicas que no requieren autenticación
  const publicUrls = ['/login'];

  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req); // dejar pasar sin token
  }

  // Si no hay token, redirigir al login
  if (!token) {
    snackBar.open('Debés iniciar sesión para continuar.', 'Cerrar', {
      duration: 4000,
      verticalPosition: 'top',
    });

    router.navigate(['/login']);
    return EMPTY; 
  }

  // Clonar request con token
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        snackBar.open('Tu sesión ha expirado. Iniciá sesión nuevamente.', 'Cerrar', {
          duration: 4000,
          verticalPosition: 'top',
        });

        // Limpiar session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rol');
        localStorage.removeItem('products');

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
