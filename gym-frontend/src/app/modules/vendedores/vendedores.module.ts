import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VendedoresRoutingModule } from './vendedores-routing.module';
import { ListaVendedoresComponent } from './lista-vendedores/lista-vendedores.component';
import { FormVendedorComponent } from './form-vendedor/form-vendedor.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ListaVendedoresComponent, FormVendedorComponent],
  imports: [
    CommonModule, ReactiveFormsModule, VendedoresRoutingModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule
  ]
})
export class VendedoresModule { }
