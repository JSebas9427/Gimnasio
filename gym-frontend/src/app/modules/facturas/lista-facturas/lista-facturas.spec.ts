import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaFacturas } from './lista-facturas';

describe('ListaFacturas', () => {
  let component: ListaFacturas;
  let fixture: ComponentFixture<ListaFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaFacturas],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaFacturas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
