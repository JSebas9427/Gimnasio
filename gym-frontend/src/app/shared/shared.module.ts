import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  exports: [CommonModule, RouterModule, MatListModule, MatIconModule]
})
export class SharedModule { }
