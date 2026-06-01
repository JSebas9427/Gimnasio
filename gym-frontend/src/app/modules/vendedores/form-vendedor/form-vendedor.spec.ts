import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVendedor } from './form-vendedor';

describe('FormVendedor', () => {
  let component: FormVendedor;
  let fixture: ComponentFixture<FormVendedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormVendedor],
    }).compileComponents();

    fixture = TestBed.createComponent(FormVendedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
