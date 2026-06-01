import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan, Cliente, Vendedor, Factura, TipoFactura } from '../models/models';

const API = environment.apiUrl;

// ── Plan Service ──────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PlanService {
  private url = `${API}/planes`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Plan[]>             { return this.http.get<Plan[]>(this.url); }
  getById(id: number): Observable<Plan>    { return this.http.get<Plan>(`${this.url}/${id}`); }
  create(p: Plan): Observable<Plan>        { return this.http.post<Plan>(this.url, p); }
  update(id: number, p: Plan): Observable<Plan> { return this.http.put<Plan>(`${this.url}/${id}`, p); }
  delete(id: number): Observable<void>     { return this.http.delete<void>(`${this.url}/${id}`); }
}

// ── Cliente Service ───────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private url = `${API}/clientes`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]>                  { return this.http.get<Cliente[]>(this.url); }
  getById(cc: number): Observable<Cliente>         { return this.http.get<Cliente>(`${this.url}/${cc}`); }
  create(c: Cliente): Observable<Cliente>          { return this.http.post<Cliente>(this.url, c); }
  update(cc: number, c: Cliente): Observable<Cliente> { return this.http.put<Cliente>(`${this.url}/${cc}`, c); }
  delete(cc: number): Observable<void>             { return this.http.delete<void>(`${this.url}/${cc}`); }
}

// ── Vendedor Service ──────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VendedorService {
  private url = `${API}/vendedores`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Vendedor[]>                     { return this.http.get<Vendedor[]>(this.url); }
  getById(cc: number): Observable<Vendedor>            { return this.http.get<Vendedor>(`${this.url}/${cc}`); }
  create(v: Vendedor): Observable<Vendedor>            { return this.http.post<Vendedor>(this.url, v); }
  update(cc: number, v: Vendedor): Observable<Vendedor> { return this.http.put<Vendedor>(`${this.url}/${cc}`, v); }
  delete(cc: number): Observable<void>                 { return this.http.delete<void>(`${this.url}/${cc}`); }
}

// ── Factura Service ───────────────────────────────────
@Injectable({ providedIn: 'root' })
export class FacturaService {
  private url = `${API}/facturas`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Factura[]>                        { return this.http.get<Factura[]>(this.url); }
  getById(id: number): Observable<Factura>               { return this.http.get<Factura>(`${this.url}/${id}`); }
  getByCliente(cc: number): Observable<Factura[]>        { return this.http.get<Factura[]>(`${this.url}/cliente/${cc}`); }
  getByTipo(tipo: TipoFactura): Observable<Factura[]>    { return this.http.get<Factura[]>(`${this.url}/tipo/${tipo}`); }
  create(f: Factura): Observable<Factura>                { return this.http.post<Factura>(this.url, f); }
  delete(id: number): Observable<void>                   { return this.http.delete<void>(`${this.url}/${id}`); }
}
