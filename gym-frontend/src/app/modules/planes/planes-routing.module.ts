import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaPlanesComponent } from './lista-planes/lista-planes.component';

const routes: Routes = [{ path: '', component: ListaPlanesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanesRoutingModule { }
