import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationCoursEnsComponent } from './consultation-cours-ens.component';

describe('ConsultationCoursEnsComponent', () => {
  let component: ConsultationCoursEnsComponent;
  let fixture: ComponentFixture<ConsultationCoursEnsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultationCoursEnsComponent]
    });
    fixture = TestBed.createComponent(ConsultationCoursEnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
