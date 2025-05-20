import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStateService } from '../../data-access/cart-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styles: ``,
})
export class HeaderComponent {
  cartState = inject(CartStateService).state;
  router = inject(Router);

  isMobileMenuOpen = false;
  
  isMenuOpen = false;

  @ViewChild('menuContainer', { static: false }) menuRef!: ElementRef;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.menuRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  get user(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  get displayRol(): string {
    const rol = localStorage.getItem('rol');
    switch (rol) {
      case 'admin': return 'Admin';
      case 'vip':   return 'VIP';
      case 'normal':return 'No VIP';
      default:      return '';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    localStorage.removeItem('products');
    this.cartState.clear(null);
    this.router.navigate(['/login']);
  }
}
