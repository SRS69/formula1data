import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { StagioniService } from '../servizi/stagioni.service';
import {ActivatedRoute, Router} from '@angular/router';
import { MapNO } from '../servizi/cache.service';

@Component({
  selector: 'app-stagioni',
  templateUrl: './stagioni.component.html',
  styleUrls: ['./stagioni.component.css']
})
export class StagioniComponent implements OnInit {

  //Stagione selezionata
  selezione: Stagione | undefined;
  //Mappa di tutte le stagioni
  mappaStagioni: MapNO<number, Stagione> | undefined;
  constructor(private stagioniService: StagioniService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    //Carica tutte le stagioni in cache
    this.mappaStagioni = this.stagioniService.getTutteStagioni();

    //Estrae l'id inserito nella URL e carica la stagione richiesta
    this.activatedRoute.params.subscribe(routeParams => {
      let anno: number = parseInt(routeParams['id']);
      if(anno) 
        this.selezionaStagione(anno);
      else {
        this.urlVuoto();
      }
    });
  }

  /**
   * Gestione se l'url è vuoto va alla stagione corrente
   */
  private async urlVuoto() {
    let tmp: Stagione | undefined = await this.stagioniService.getStagioneCorrente();
    if(tmp) {
      this.router.navigateByUrl('/stagione/'+tmp.anno);
    }
  }
  /**
   * Seleziona una stagione e la carica. In caso di erorre carica la stagione corrente
   * @param anno Anno della stagione da selezionare
   */
  private async selezionaStagione(anno: number) {
    try {
      this.selezione = await this.stagioniService.completaStagione(anno);
    } catch (error) {
      this.urlVuoto()
    }
  }

  /**
   * Restituisce l'anno maggiore attualmente presente in cache
   * @returns Anno maggiore contenuto in cache
   */
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
