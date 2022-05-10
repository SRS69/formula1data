import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { Circuito } from 'src/app/classi/circuito';
import { MapNO } from 'src/app/servizi/cache.service';
import { CircuitiService } from 'src/app/servizi/circuiti.service';

@Component({
  selector: 'app-lista-circuiti',
  templateUrl: './lista-circuiti.component.html',
  styleUrls: ['./lista-circuiti.component.css']
})
export class ListaCircuitiComponent implements OnInit {

  mappaCiruciti: MapNO<string, Circuito> | undefined;
  constructor(private circuitiService: CircuitiService) {
  }
  ngOnInit(): void {
    this.mappaCiruciti = this.circuitiService.getTuttiCircuiti();
    console.log(this.mappaCiruciti);
  }

}
