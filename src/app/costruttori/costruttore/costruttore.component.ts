import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Costruttore } from 'src/app/classi/costruttore';
import { CostruttoriService } from 'src/app/servizi/costruttori.service';

@Component({
  selector: 'app-costruttore',
  templateUrl: './costruttore.component.html',
  styleUrls: ['./costruttore.component.css']
})
export class CostruttoreComponent implements OnInit {

  selezione: Costruttore | undefined;
  constructor(private costruttoriService: CostruttoriService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    //Controlla se è cambiato l'id dell'url
    this.activatedRoute.params.subscribe(routeParams => {
      let id: string = routeParams['id'];
      //Se l'id esiste seleziona il costruttore
      if(id)
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
    }
    //Se non esiste il costruttore torna alla pagina dei costruttori
    catch (error) {
      this.router.navigate(['/costruttore']);
    }
  }

}
