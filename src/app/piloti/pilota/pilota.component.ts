import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pilota } from 'src/app/classi/pilota';
import { PilotiService } from 'src/app/servizi/piloti.service';

@Component({
  selector: 'app-pilota',
  templateUrl: './pilota.component.html',
  styleUrls: ['./pilota.component.css']
})
export class PilotaComponent implements OnInit {

  selezione: Pilota | undefined;
  constructor(private pilotiService: PilotiService, private activatedRoute: ActivatedRoute, private router: Router) {
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

}
