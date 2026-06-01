import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaFacturasComponent } from './lista-facturas/lista-facturas.component';
const routes: Routes = [{ path: '', component: ListaFacturasComponent }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class FacturasRoutingModule { }
