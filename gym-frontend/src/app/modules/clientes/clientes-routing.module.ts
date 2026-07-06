import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';
import { PerfilClienteComponent } from './perfil-cliente/perfil-cliente.component';

const routes: Routes = [
  { path: '',      component: ListaClientesComponent },
  { path: ':cc',   component: PerfilClienteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
