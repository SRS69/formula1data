import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gara } from 'src/app/classi/gara';
import { Stagione } from 'src/app/classi/stagione';
import { StagioniService } from 'src/app/servizi/stagioni.service';

@Component({
  selector: 'app-gara',
  templateUrl: './gara.component.html',
  styleUrls: ['./gara.component.css']
})
export class GaraComponent implements OnInit {

  selezione: Gara | undefined;
  constructor(private stagioniService: StagioniService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(routeParams => {
      let anno = parseInt(routeParams['id']);
      let round = parseInt(routeParams['idg']);
      if(anno) {
        if(round) {
          this.selezionaGara(anno, round);
        }
        else {
          this.router.navigateByUrl('/stagione/'+anno);
        }
      }
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
  private async selezionaGara(anno: number, round: number) {
    this.selezione = await this.stagioniService.getGaraStagione(anno, round);
    this.stagioniService.getClassificaGara(anno, round);
  }

}
