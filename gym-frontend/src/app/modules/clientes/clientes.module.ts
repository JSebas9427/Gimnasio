import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientesRoutingModule } from './clientes-routing.module';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';
import { FormClienteComponent } from './form-cliente/form-cliente.component';
import { RegistroCompletoComponent } from './registro-completo/registro-completo.component';
import { PerfilClienteComponent } from './perfil-cliente/perfil-cliente.component';

import { MatTableModule }           from '@angular/material/table';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatCardModule }            from '@angular/material/card';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatSelectModule }          from '@angular/material/select';
import { MatChipsModule }           from '@angular/material/chips';
import { MatDividerModule }         from '@angular/material/divider';
import { MatTabsModule }            from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule }           from '@angular/material/badge';

@NgModule({
  declarations: [
    ListaClientesComponent,
    FormClienteComponent,
    RegistroCompletoComponent,
    PerfilClienteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientesRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
  ]
})
export class ClientesModule { }
