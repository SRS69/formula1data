import { Component, OnInit } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { StagioniService } from '../servizi/stagioni.service';

@Component({
  selector: 'app-stagioni',
  templateUrl: './stagioni.component.html',
  styleUrls: ['./stagioni.component.css']
})
export class StagioniComponent implements OnInit {

  selezione: Stagione | undefined;
  constructor(private stagioniService: StagioniService) {
  }

  async load() {
    this.selezione = await this.stagioniService.completaStagione(2022);
  }

  ngOnInit(): void {
  }

}
