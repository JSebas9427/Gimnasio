import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private url = `${environment.apiUrl}/planes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.url);
  }

  getById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.url}/${id}`);
  }

  create(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.url, plan);
  }

  update(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.url}/${id}`, plan);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
