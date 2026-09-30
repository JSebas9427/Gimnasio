import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Abre rutas de la app en una pestaña nueva respetando el <base href> (/gym/ en XAMPP).
@Injectable({ providedIn: 'root' })
export class NavegacionService {

  constructor(private router: Router, private location: Location) {}

  url(commands: any[]): string {
    const ruta = this.router.serializeUrl(this.router.createUrlTree(commands));
    return this.location.prepareExternalUrl(ruta);
  }

  abrirEnNuevaPestana(commands: any[]): void {
    window.open(this.url(commands), '_blank');
  }

  perfilCliente(cc: number | null | undefined): void {
    if (cc) this.abrirEnNuevaPestana(['/clientes', cc]);
  }

  perfilVendedor(cc: number | null | undefined): void {
    if (cc) this.abrirEnNuevaPestana(['/vendedores', cc]);
  }

  detalleFactura(id: number | null | undefined): void {
    if (id) this.abrirEnNuevaPestana(['/facturas', id]);
  }

  /**
   * Los navegadores bloquean window.open si no ocurre justo en el clic del usuario.
   * Para abrir algo cuando responda el servidor (p. ej. la factura recién creada),
   * se abre la pestaña vacía en el clic y luego se le asigna la ruta.
   */
  reservarPestana(): PestanaReservada {
    const win = window.open('', '_blank');
    return {
      abrir: (commands: any[]) => {
        const url = this.url(commands);
        if (win && !win.closed) win.location.href = url;
        else window.open(url, '_blank');
      },
      cerrar: () => { if (win && !win.closed) win.close(); }
    };
  }
}

export interface PestanaReservada {
  abrir(commands: any[]): void;
  cerrar(): void;
}
