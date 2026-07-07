import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaVendedoresComponent } from './lista-vendedores/lista-vendedores.component';
import { PerfilVendedorComponent } from './perfil-vendedor/perfil-vendedor.component';

const routes: Routes = [
  { path: '',    component: ListaVendedoresComponent },
  { path: ':cc', component: PerfilVendedorComponent  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendedoresRoutingModule { }
