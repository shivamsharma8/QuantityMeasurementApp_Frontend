import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// We will map these correctly once feature components are generated.
// Using lazy loading for feature components
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'quantity', loadComponent: () => import('./features/quantity/quantity.component').then(m => m.QuantityComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'history', loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
