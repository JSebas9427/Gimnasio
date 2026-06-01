import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
