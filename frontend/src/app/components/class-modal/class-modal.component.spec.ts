import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassModalComponent } from './class-modal.component';

describe('ClassModalComponent', () => {
  let component: ClassModalComponent;
  let fixture: ComponentFixture<ClassModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

