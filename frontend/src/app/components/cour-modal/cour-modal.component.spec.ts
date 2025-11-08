import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourModalComponent } from './cour-modal.component';

describe('CourModalComponent', () => {
  let component: CourModalComponent;
  let fixture: ComponentFixture<CourModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CourModalComponent]
    });
    fixture = TestBed.createComponent(CourModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
