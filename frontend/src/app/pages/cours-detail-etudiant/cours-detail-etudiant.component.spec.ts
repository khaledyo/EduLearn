import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursDetailEtudiantComponent } from './cours-detail-etudiant.component';

describe('CoursDetailEtudiantComponent', () => {
  let component: CoursDetailEtudiantComponent;
  let fixture: ComponentFixture<CoursDetailEtudiantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursDetailEtudiantComponent]
    });
    fixture = TestBed.createComponent(CoursDetailEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
