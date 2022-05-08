import { Component, OnInit } from '@angular/core';
import { Circuito } from 'src/app/classi/circuito';
import { CircuitiService } from 'src/app/servizi/circuiti.service';

@Component({
  selector: 'app-lista-circuiti',
  templateUrl: './lista-circuiti.component.html',
  styleUrls: ['./lista-circuiti.component.css']
})
export class ListaCircuitiComponent implements OnInit {

  mappaCiruciti: Map<string, Circuito>;
  constructor(private circuitiService: CircuitiService) {
    this.mappaCiruciti = this.circuitiService.getTuttiCircuiti();
    console.log(this.mappaCiruciti);
  }
  ngOnInit(): void {
    //this.mappaCiruciti = this.circuitiService.getTuttiCircuiti();
  }

}
