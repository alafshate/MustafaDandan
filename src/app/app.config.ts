import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RedirectCommand, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { PortfolioService } from './services/portfolio.service';
import { AdminService } from './admin/admin.service';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter([
    { path: '', component: AppComponent, resolve: { content: () => {
      const router = inject(Router);
      return inject(PortfolioService).load().catch(() => new RedirectCommand(router.parseUrl('/unavailable')));
    } } },
    { path: 'admin/login', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
    { path: 'admin', canActivate: [async () => {
      const router = inject(Router);
      return await inject(AdminService).authenticated() || router.parseUrl('/admin/login');
    }], loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
    { path: 'unavailable', loadComponent: () => import('./shell.component').then(m => m.UnavailableComponent) },
    { path: '**', redirectTo: '' },
  ])],
};
