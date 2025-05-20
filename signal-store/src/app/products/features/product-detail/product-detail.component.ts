import { Component, effect, inject, input } from '@angular/core';
import { ProductDetailSateService } from '../../data-access/proudct-detail-state.service';
import { CurrencyPipe } from '@angular/common';
import { CartStateService } from '../../../shared/data-access/cart-state.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe,LoadingComponent],
  templateUrl: './product-detail.component.html',
  providers: [ProductDetailSateService],
})
export default class ProductDetailComponent {
  productDetailState = inject(ProductDetailSateService).state;
  cartState = inject(CartStateService).state;

  constructor() {
    const route = inject(ActivatedRoute);
    const id = toSignal(route.params.pipe(map(p => p['id'])), { initialValue: '' });
  
    effect(() => {
      if (id()) {
        this.productDetailState.getById(id());
      }
    });
  }

  addToCart() {
    this.cartState.add({
      product: this.productDetailState.product()!,
      quantity: 1,
    });
  }
}
