import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/models';

export interface ClienteResumenDTO {
  cc: number;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'AGOTADO' | 'SIN_PLAN';
  ultimaFechaFin: string | null;
  ultimoPlan: string | null;
  diasRestantes: number | null;
}

export interface ClientePerfilDTO {
  cc: number;
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'AGOTADO' | 'SIN_PLAN';
  ultimaFechaFin: string | null;
  ultimoPlan: string | null;
  diasRestantes: number | null;
  facturas: any[];
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private url = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  getAllConEstado(): Observable<ClienteResumenDTO[]> {
    return this.http.get<ClienteResumenDTO[]>(`${this.url}/con-estado`);
  }

  buscar(q: string, estado: string): Observable<ClienteResumenDTO[]> {
    let params = new HttpParams();
    if (q)      params = params.set('q', q);
    if (estado && estado !== 'TODOS') params = params.set('estado', estado);
    return this.http.get<ClienteResumenDTO[]>(`${this.url}/buscar`, { params });
  }

  getPerfil(cc: number): Observable<ClientePerfilDTO> {
    return this.http.get<ClientePerfilDTO>(`${this.url}/${cc}/perfil`);
  }

  getById(cc: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${cc}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }

  update(cc: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${cc}`, cliente);
  }

  delete(cc: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${cc}`);
  }
}
