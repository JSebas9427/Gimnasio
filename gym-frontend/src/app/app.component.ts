import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Gimnasio';
  sidenavOpen = true;

  menuItems = [
    { label: 'Reportes',    icon: 'bar_chart',       route: '/reportes'   },
    { label: 'Planes',      icon: 'fitness_center',  route: '/planes'     },
    { label: 'Clientes',    icon: 'people',           route: '/clientes'   },
    { label: 'Vendedores',  icon: 'badge',            route: '/vendedores' },
    { label: 'Facturas',    icon: 'receipt_long',     route: '/facturas'   },
  ];
}
