import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCircuitiComponent } from './lista-circuiti.component';

describe('ListaCircuitiComponent', () => {
  let component: ListaCircuitiComponent;
  let fixture: ComponentFixture<ListaCircuitiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaCircuitiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCircuitiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
