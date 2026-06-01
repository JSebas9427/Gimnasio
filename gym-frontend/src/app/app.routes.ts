import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'planes', pathMatch: 'full' },
  {
    path: 'planes',
    loadChildren: () => import('./modules/planes/planes.module').then(m => m.PlanesModule)
  },
  {
    path: 'clientes',
    loadChildren: () => import('./modules/clientes/clientes.module').then(m => m.ClientesModule)
  },
  {
    path: 'vendedores',
    loadChildren: () => import('./modules/vendedores/vendedores.module').then(m => m.VendedoresModule)
  },
  {
    path: 'facturas',
    loadChildren: () => import('./modules/facturas/facturas.module').then(m => m.FacturasModule)
  },
  { path: '**', redirectTo: 'planes' }
];
