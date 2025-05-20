import { Component, HostListener, inject } from '@angular/core';
import { ProductsSateService } from '../../data-access/products-state.service';
import { ProductCardComponent } from '../../ui/product-card/product-card.component';
import { CartStateService } from '../../../shared/data-access/cart-state.service';
import { Product } from '../../../shared/interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, LoadingComponent],
  templateUrl: './product-list.component.html',
  providers: [ProductsSateService],
})
export default class ProductListComponent {
  productsState = inject(ProductsSateService);
  cartState = inject(CartStateService).state;

  public showScrollTop = false;

  @HostListener('window:scroll', [])
  onScroll() {
    this.showScrollTop = window.scrollY > 80;
  }
  

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changePage() {
    const page = this.productsState.state.page() + 1;
    this.productsState.changePage$.next(page);
  }

  addToCart(product: Product) {
    this.cartState.add({
      product,
      quantity: 1,
    });
  }
}
