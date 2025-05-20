import { Injectable, Signal, effect, signal, inject } from '@angular/core';
import { ProductItemCart } from '../interfaces/product.interface';
import { signalSlice } from 'ngxtension/signal-slice';
import { StorageService } from './storage.service';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { AuthService } from '../../auth/auth.service';
import { CartApiService } from '../../services/cart-api.service';

interface State {
  products: ProductItemCart[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private _storageService = inject(StorageService);
  private _http = inject(HttpClient); 
  private _cartApi = inject(CartApiService);
  private _authService = inject(AuthService); 
  readonly carritoBackend = signal<any>(null);

  private initialState: State = {
    products: [],
    loaded: false,
  };

  readonly descuentos = signal<string[]>([]);
  readonly totalDescuento = signal<number | null>(null);

  loadProducts$ = this._storageService
    .loadProducts()
    .pipe(map((products) => ({ products, loaded: true })));

  state = signalSlice({
    initialState: this.initialState,
    sources: [this.loadProducts$],
    selectors: (state) => ({
      count: () =>
        state().products.reduce((acc, product) => acc + product.quantity, 0),
      price: () =>
        state().products.reduce(
          (acc, product) => acc + product.product.price * product.quantity,
          0,
        ),
    }),
    actionSources: {
      add: (state, action$: Observable<ProductItemCart>) =>
        action$.pipe(map((product) => this.add(state, product))),
      remove: (state, action$: Observable<number>) =>
        action$.pipe(map((id) => this.remove(state, id))),
      udpate: (state, action$: Observable<ProductItemCart>) =>
        action$.pipe(map((product) => this.update(state, product))),
      clear: (state, action$: Observable<null>) =>
        action$.pipe(map(() => ({ products: [] }))),
    },
    effects: () => ({ load: () => {} }),
  });

  readonly cartEffect = effect(() => {
    if (this.state().loaded) {
      this._storageService.saveProducts(this.state().products);
      this.sendCartToBackendEffect(this.state);
    }
  });

  private add(state: Signal<State>, product: ProductItemCart) {
    const isInCart = state().products.find(
      (productInCart) => productInCart.product.id === product.product.id,
    );

    if (!isInCart) {
      return {
        products: [...state().products, { ...product, quantity: 1 }],
      };
    }

    isInCart.quantity += 1;
    return {
      products: [...state().products],
    };
  }

  private remove(state: Signal<State>, id: number) {
    return {
      products: state().products.filter((product) => product.product.id !== id),
    };
  }

  private update(state: Signal<State>, product: ProductItemCart) {
    if (product.quantity < 1) {
      return { products: [...state().products] };
    }  
    const products = state().products.map((productInCart) => {
      if (productInCart.product.id === product.product.id) {
        return { ...productInCart, quantity: product.quantity };
      }
      return productInCart;
    });
  
    return { products };
  }
  

  private sendCartToBackendEffect(state: Signal<State>) {
    const products = state().products;
    if (products.length === 0) return;
  
    this._cartApi.enviarCarrito(products).subscribe({
      next: (res) => {
        console.log('Descuentos actualizados automáticamente', res);
        this.descuentos.set(res.descuentos_aplicados || []);
        this.totalDescuento.set(res.total_pagado ?? null);
        this.carritoBackend.set(res);
      },
      error: (err) => {
        console.error('Error al actualizar descuentos automáticamente', err);
      }
    });
  }
  
  
  finalizarCompra(): void {
    const products = this.state().products;
    if (products.length === 0) {
      alert('El carrito está vacío. Agrega productos antes de comprar.');
      return;
    }
  
    this._cartApi.finalizarCompra(products).subscribe({
      next: (res) => {
        console.log('✅ Compra finalizada con éxito', res);
        this.descuentos.set(res.descuentos_aplicados || []);
        this.totalDescuento.set(res.total_pagado ?? null);
        this.carritoBackend.set(res);
  
        this.resetCart();
  
        alert(`Compra realizada con éxito.\nTotal pagado: $${res.total_pagado}\nDescuentos:\n${res.descuentos_aplicados.join('\n')}`);
      },
      error: (err) => {
        console.error('❌ Error al finalizar compra', err);
        alert('Ocurrió un error al procesar la compra.');
      }
    });
  }

  resetCart(): void {
    this.state.clear(null);
    this.descuentos.set([]);
    this.totalDescuento.set(null);
    this.carritoBackend.set(null);
  }  

}
