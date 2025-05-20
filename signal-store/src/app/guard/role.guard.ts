import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[]; // e.g. ['admin']
    const userRole = this.authService.getRol(); // obtiene 'admin', 'cliente', etc.

    if (expectedRoles.includes(userRole!)) {
      return true;
    }

    // Redirigir si el rol no es válido
    this.router.navigate(['/']);
    return false;
  }
}
