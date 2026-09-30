import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaFacturasComponent } from './lista-facturas/lista-facturas.component';
import { DetalleFacturaComponent } from './detalle-factura/detalle-factura.component';

const routes: Routes = [
  { path: '',    component: ListaFacturasComponent },
  { path: ':id', component: DetalleFacturaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturasRoutingModule { }
