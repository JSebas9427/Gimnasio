import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPlanes } from './lista-planes';

describe('ListaPlanes', () => {
  let component: ListaPlanes;
  let fixture: ComponentFixture<ListaPlanes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPlanes],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaPlanes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
