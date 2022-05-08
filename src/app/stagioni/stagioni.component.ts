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
  stagioni: Stagione[] | undefined;
  constructor(private stagioniService: StagioniService) {
    this.primoLoad();
    this.loadTutteStagioni();
  }

  private async primoLoad() {
    this.selezione = await this.stagioniService.getStagioneCorrente();
    if(this.selezione)
      this.completaStagione(this.selezione.anno);
  }
  async completaStagione(anno: number) {
    this.selezione = await this.stagioniService.completaStagione(anno);
  }
  async loadTutteStagioni() {
    this.stagioni = await this.stagioniService.getTutteStagioni();
  }

  ngOnInit(): void {
  }

}
