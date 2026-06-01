import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaVendedoresComponent } from './lista-vendedores/lista-vendedores.component';
const routes: Routes = [{ path: '', component: ListaVendedoresComponent }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class VendedoresRoutingModule { }
