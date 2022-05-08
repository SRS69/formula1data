import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostruttoreComponent } from './costruttore.component';

describe('CostruttoreComponent', () => {
  let component: CostruttoreComponent;
  let fixture: ComponentFixture<CostruttoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostruttoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostruttoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
