import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueCoursComponent } from './catalogue-cours.component';

describe('CatalogueCoursComponent', () => {
  let component: CatalogueCoursComponent;
  let fixture: ComponentFixture<CatalogueCoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogueCoursComponent]
    });
    fixture = TestBed.createComponent(CatalogueCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
