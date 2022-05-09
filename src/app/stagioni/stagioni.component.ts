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
  constructor(private stagioniService: StagioniService, private activatedRoute: ActivatedRoute, private router: Router) {
  }
  ngOnInit(): void {
    this.mappaStagioni = this.stagioniService.getTutteStagioni();

    this.activatedRoute.params.subscribe(routeParams => {
      let anno = parseInt(routeParams['id']);
      if(anno) 
        this.selezionaStagione(anno);
      else {
        this.urlVuoto();
      }
    });
  }

  private async urlVuoto() {
    let tmp: Stagione | undefined = await this.stagioniService.getStagioneCorrente();
    if(tmp) {
      this.router.navigateByUrl('/stagione/'+tmp.anno);
    }
  }
  private async selezionaStagione(anno: number) {
    this.selezione = await this.stagioniService.completaStagione(anno);
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
}
