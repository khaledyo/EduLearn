import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCoursEtudiantComponent } from './mes-cours-etudiant.component';

describe('MesCoursEtudiantComponent', () => {
  let component: MesCoursEtudiantComponent;
  let fixture: ComponentFixture<MesCoursEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesCoursEtudiantComponent]
    });
    fixture = TestBed.createComponent(MesCoursEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
