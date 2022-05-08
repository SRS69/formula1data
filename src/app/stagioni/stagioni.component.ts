import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { StagioniService } from '../servizi/stagioni.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stagioni',
  templateUrl: './stagioni.component.html',
  styleUrls: ['./stagioni.component.css']
})
export class StagioniComponent implements OnInit {

  selezione: Stagione | undefined;
  mappaStagioni: Map<number, Stagione> | undefined;
  constructor(private stagioniService: StagioniService, private router: ActivatedRoute) {
    console.log(this.router.snapshot.params);
  }
  ngOnInit(): void {
    let anno = parseInt(this.router.snapshot.params['id']);
    console.log(this.router.snapshot.params)
    if(anno) {
      this.selezioneStagione(anno);
      this.mappaStagioni = this.stagioniService.getTutteStagioni();
    }
    else {
      this.stagioneCorrente();
    }
  }

  getAnnoMaggiore(): number {
    if(this.mappaStagioni) {
      let anno: number = 0;
      this.mappaStagioni.forEach((stagione: Stagione) => {
        if(stagione.anno > anno) {
          anno = stagione.anno;
        }
      });
      return anno;
    }
    return (new Date(Date.now())).getFullYear();
  }

  private async stagioneCorrente() {
    this.selezione = await this.stagioniService.getStagioneCorrente();
    if(this.selezione) {
      this.completaStagione(this.selezione.anno);
    }
  }
  private async selezioneStagione(anno: number) {
    this.selezione = await this.stagioniService.getStagione(anno);
    if(this.selezione)
      this.completaStagione(this.selezione.anno);
  }
  private async completaStagione(anno: number) {
    this.selezione = await this.stagioniService.completaStagione(anno);
  }

}
