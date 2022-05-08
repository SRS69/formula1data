import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPilotiComponent } from './lista-piloti.component';

describe('ListaPilotiComponent', () => {
  let component: ListaPilotiComponent;
  let fixture: ComponentFixture<ListaPilotiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaPilotiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPilotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
