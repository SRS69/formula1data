import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCostruttoriComponent } from './lista-costruttori.component';

describe('ListaCostruttoriComponent', () => {
  let component: ListaCostruttoriComponent;
  let fixture: ComponentFixture<ListaCostruttoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaCostruttoriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCostruttoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
