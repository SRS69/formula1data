import { KeyValue } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Circuito } from 'src/app/classi/circuito';
import { Gara } from 'src/app/classi/gara';
import { CircuitiService } from 'src/app/servizi/circuiti.service';

@Component({
  selector: 'app-circuito',
  templateUrl: './circuito.component.html',
  styleUrls: ['./circuito.component.css']
})
export class CircuitoComponent implements OnInit {

  id: string | undefined;

  selezione: Circuito | undefined;
  constructor(private circuitiService: CircuitiService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log(this.route.snapshot.params);
    if(this.id) {
      this.selezionaCircuito(this.id);
    }
    else
      this.selezionaCircuito(this.route.snapshot.params['id']);
  }

  async selezionaCircuito(id: string) {
    this.selezione = await this.circuitiService.completaCircuito(id);
  }

  inversKey = (a: KeyValue<number, Gara>, b: KeyValue<number, Gara>): number => {
    return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
  }

}
