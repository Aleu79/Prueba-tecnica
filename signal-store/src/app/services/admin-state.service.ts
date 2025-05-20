import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  private seccionActual = new BehaviorSubject<string>('dashboard');
  seccionActual$ = this.seccionActual.asObservable();

  cambiarSeccion(seccion: string) {
    this.seccionActual.next(seccion);
  }
}
