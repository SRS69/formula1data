import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaraComponent } from './gara.component';

describe('GaraComponent', () => {
  let component: GaraComponent;
  let fixture: ComponentFixture<GaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GaraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
