import { Routes } from '@angular/router';

import { AdminLoginComponent } from './admin/admin-login.component';
import { AdminComponent } from './admin/admin.component';
import { ProductDetail } from './product-detail/product-detail';

import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/register/login/login';
import { MisPedidosComponent } from './pages/register/mis-pedidos/mis-pedidos';
import { CheckoutComponent } from './pages/register/checkout/checkout';
import { ResetPasswordComponent } from './pages/register/reset-password';

import { TiendaComponent } from './pages/register/tienda/tienda';

export const routes: Routes = [
  {
    path: 'tienda',
    component: TiendaComponent
  },
  {
    path: 'producto/:id',
    component: ProductDetail
  },
  {
    path: 'registro',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'mis-pedidos',
    component: MisPedidosComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  }
];