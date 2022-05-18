import { KeyValue } from '@angular/common';
import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, of } from 'rxjs';
import { Costruttore } from 'src/app/classi/costruttore';
import { PostoClassificaCostruttori } from 'src/app/classi/stagione';
import { CostruttoriService } from 'src/app/servizi/costruttori.service';

@Component({
  selector: 'app-costruttore',
  templateUrl: './costruttore.component.html',
  styleUrls: ['./costruttore.component.css']
})
export class CostruttoreComponent implements OnInit, AfterViewChecked {

  selezione: Costruttore | undefined;
  resizeObservable$: any;
  constructor(private costruttoriService: CostruttoriService, private activatedRoute: ActivatedRoute, private router: Router) { }
  ngAfterViewChecked(): void {
    this.setMaxAltezzaCard();
  }

  ngOnInit(): void {
    //Controlla se è cambiato l'id dell'url
    this.activatedRoute.params.subscribe(routeParams => {
      let id: string = routeParams['id'];
      //Se l'id esiste seleziona il costruttore
      if (id)
        this.selezionaCostruttore(id);
      //Altrimenti carica la pagine di tutti i costruttori
      else
        this.router.navigate(['/costruttore']);
    });
  }

  /**
   * Seleziona un costruttore dalla mappa dei costruttori e lo completa
   * @param id l'id del costruttore da selezionare
   */
  private async selezionaCostruttore(id: string) {
    try {
      this.selezione = await this.costruttoriService.completaCostruttore(id);
      //this.getMaxAltezzaCard();
    }
    //Se non esiste il costruttore torna alla pagina dei costruttori
    catch (error) {
      this.router.navigate(['/costruttore']);
    }
  }

  inversKey = (a: KeyValue<number, PostoClassificaCostruttori>, b: KeyValue<number, PostoClassificaCostruttori>): number => {
    return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
  }

  /**
   * Imposta l'altezza della carta
   */
  setMaxAltezzaCard() {
    console.log("A")
    //Altezza della tabella
    let hTab: number | undefined = document.getElementById('tab')?.clientHeight;
    if(!hTab)
      return;

    //Carta    
    let carta = document.getElementById('carta');
    if(!carta)
      return;

    //Altezza nulla
    if (!hTab) {
      carta.style.maxHeight = "0px";
      return;
    }

    if(window.innerWidth < 1280) {
      carta.style.maxHeight = "";
      return;
    }

    //Tabella più alta dello schermo
    if (hTab > window.innerHeight) {
      carta.style.maxHeight = hTab + "px";
      return;
    }

    //Tabella più piccolo dello schermo
    carta.style.maxHeight = (window.innerHeight - 200) + "px";
  }
}
