import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPlan } from './form-plan';

describe('FormPlan', () => {
  let component: FormPlan;
  let fixture: ComponentFixture<FormPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(FormPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
