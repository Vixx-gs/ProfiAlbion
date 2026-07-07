import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'ProfiAlbion' },
  {
    path: 'flips',
    loadComponent: () => import('./pages/flips/flips').then((m) => m.Flips),
    title: 'Calculadora de Flipping de Mercado · ProfiAlbion',
  },
  {
    path: 'precios',
    loadComponent: () =>
      import('./pages/price-checker/price-checker').then((m) => m.PriceChecker),
    title: 'Comprobador de precios · ProfiAlbion',
  },
  {
    path: 'cultivos',
    loadComponent: () => import('./pages/farming/farming').then((m) => m.Farming),
    title: 'Calculadora de Cultivos · ProfiAlbion',
  },
  {
    path: 'animales',
    loadComponent: () => import('./pages/breeding/breeding').then((m) => m.Breeding),
    title: 'Calculadora de Animales · ProfiAlbion',
  },
  {
    path: 'maestrias',
    loadComponent: () => import('./pages/masteries/masteries').then((m) => m.Masteries),
    title: 'Gestión de maestrías · ProfiAlbion',
  },
  {
    path: 'wiki',
    loadComponent: () => import('./pages/wiki/wiki').then((m) => m.Wiki),
    title: 'Wiki · ProfiAlbion',
    children: [
      {
        path: ':section/:category/:item',
        loadComponent: () => import('./pages/wiki/wiki-item').then((m) => m.WikiItem),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
