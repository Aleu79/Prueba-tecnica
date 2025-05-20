import { Component } from '@angular/core';
import { AdminStateService } from '../../services/admin-state.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.scss']
})
export class HeaderAdminComponent {
  isMobileMenuOpen = false;
  isMenuOpen = false;

  constructor(
    private adminState: AdminStateService,
    private authService: AuthService
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  cambiarSeccion(seccion: string) {
    this.adminState.cambiarSeccion(seccion);
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
