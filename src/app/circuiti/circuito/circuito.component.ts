import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Circuito } from 'src/app/classi/circuito';
import { CircuitiService } from 'src/app/servizi/circuiti.service';

@Component({
  selector: 'app-circuito',
  templateUrl: './circuito.component.html',
  styleUrls: ['./circuito.component.css']
})
export class CircuitoComponent implements OnInit {

  id: string | undefined;

  circuitoSelezionato: Circuito | undefined;
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
    this.circuitoSelezionato = await this.circuitiService.completaCircuito(id);
  }



}
