import { KeyValue } from '@angular/common';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pilota } from 'src/app/classi/pilota';
import { PostoClassificaPiloti } from 'src/app/classi/stagione';
import { PilotiService } from 'src/app/servizi/piloti.service';

@Component({
  selector: 'app-pilota',
  templateUrl: './pilota.component.html',
  styleUrls: ['./pilota.component.css']
})
export class PilotaComponent implements OnInit, AfterViewChecked {

  selezione: Pilota | undefined;
  constructor(private pilotiService: PilotiService, private activatedRoute: ActivatedRoute, private router: Router) {
  }
  ngAfterViewChecked(): void {
    this.setMaxAltezzaCard();
  }

  ngOnInit(): void {
    //Controlla se è cambiato l'id dell'url
    this.activatedRoute.params.subscribe(routeParams => {
      let id: string = routeParams['id'];
      //Se l'id esiste seleziona il pilota
      if(id)
        this.selezionaPilota(id);
      //Altrimenti carica la pagine di tutti i piloti
      else
        this.router.navigate(['/pilota']);
      
    });
  }

  /**
   * Seleziona un pilota dalla mappa dei piloti e lo completa
   * @param id l'id della pilota da selezionare
   */
  private async selezionaPilota(id: string) {
    try {
      this.selezione = await this.pilotiService.completaPilota(id);
    }
    //Se non esiste il pilota torna alla pagina dei piloti
    catch (error) {
      this.router.navigate(['/pilota']);
    }
  }

  inversKey = (a: KeyValue<number, PostoClassificaPiloti>, b: KeyValue<number, PostoClassificaPiloti>): number => {
    return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
  }

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
      carta.style.maxHeight = "500px";
      return;
    }

    if(window.innerWidth < 1280) {
      carta.style.maxHeight = "fit-content";
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
