import { Component, inject } from '@angular/core';
import { CartItemComponent } from './ui/cart-item/cart-item.component';
import { CartStateService } from '../shared/data-access/cart-state.service';
import { ProductItemCart } from '../shared/interfaces/product.interface';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { CapitalizePipe } from '../pipes/capitalize.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartItemComponent, CurrencyPipe, CommonModule, CapitalizePipe],
  templateUrl: './cart.component.html',
  styles: ``,
})
export default class CartComponent {
  private cartService = inject(CartStateService);

  state = this.cartService.state;
  totalConDescuento = this.cartService.totalDescuento;
  descuentosAplicados = this.cartService.descuentos;
  carrito = this.cartService.carritoBackend;

  readonly cartCount = this.state.count;

  onRemove(id: number) {
    this.state.remove(id);
  }

  cancelarCompra() {
    this.cartService.resetCart();
  }

  comprar() {
    this.cartService.finalizarCompra();
  }

  onIncrease(product: ProductItemCart) {
    this.state.udpate({
      product: product.product,
      quantity: product.quantity + 1,
    });
  }

  onDecrease(product: ProductItemCart) {
    if (product.quantity > 1) {
      this.state.udpate({
        ...product,
        quantity: product.quantity - 1,
      });
    }
  }
}
