import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCoursEnseignantComponent } from './mes-cours-enseignant.component';

describe('MesCoursEnseignantComponent', () => {
  let component: MesCoursEnseignantComponent;
  let fixture: ComponentFixture<MesCoursEnseignantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesCoursEnseignantComponent]
    });
    fixture = TestBed.createComponent(MesCoursEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
