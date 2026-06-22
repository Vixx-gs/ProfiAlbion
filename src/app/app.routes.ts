import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'ProfiAlbion' },
  {
    path: 'flips',
    loadComponent: () => import('./pages/flips/flips').then((m) => m.Flips),
    title: 'Calculadora de Flipping de Mercado · ProfiAlbion',
  },
  { path: '**', redirectTo: '' },
];
