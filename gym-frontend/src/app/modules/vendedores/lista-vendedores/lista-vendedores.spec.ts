import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaVendedores } from './lista-vendedores';

describe('ListaVendedores', () => {
  let component: ListaVendedores;
  let fixture: ComponentFixture<ListaVendedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaVendedores],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaVendedores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
