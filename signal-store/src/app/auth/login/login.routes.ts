import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent),
  },
] as Routes;