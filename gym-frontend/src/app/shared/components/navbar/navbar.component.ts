import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>fitness_center</mat-icon>
      <span style="margin-left:8px; font-weight:600;">GymSystem</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/planes" routerLinkActive="active-link">
        <mat-icon>card_membership</mat-icon> Planes
      </a>
      <a mat-button routerLink="/clientes" routerLinkActive="active-link">
        <mat-icon>people</mat-icon> Clientes
      </a>
      <a mat-button routerLink="/vendedores" routerLinkActive="active-link">
        <mat-icon>badge</mat-icon> Vendedores
      </a>
      <a mat-button routerLink="/facturas" routerLinkActive="active-link">
        <mat-icon>receipt</mat-icon> Facturas
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    a { color: white !important; margin: 0 4px; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
  `]
})
export class NavbarComponent {}
