import { Injectable } from '@angular/core';
import { Stagione } from '../classi/stagione';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StagioniService {

  constructor(private apiService: ApiService) { }

  getStagioniChache(): Map<number, Stagione> {
    return this.apiService.cacheF1.stagioni;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////STAGIONI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutte le stagioni in cache
   */
   getTutteStagioni(): Array<Stagione> | undefined {
    if (this.apiService.cacheF1.stagBool)
      return Array.from(this.apiService.cacheF1.stagioni.values()).sort((a, b) => b.anno - a.anno)

    this.getTutteStagioniRicorsivo(0);

    //Controllo se il booleano in cache è vero
    if (this.apiService.cacheF1.stagBool) {
      //return a sorted array derived by the values of the cache. It is sorted by the key in decrising order
      return Array.from(this.apiService.cacheF1.stagioni.values()).sort((a, b) => b.anno - a.anno);
    }

    return undefined;
  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni in cache
   * @param offset Scostamento dalla prima stagione per la chiamata API
   */
  private getTutteStagioniRicorsivo(offset: number) {
    //Richiesta API per ottenere le stagioni di F1 presenti dopo l'offset
    this.apiService.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset).subscribe((stagioni: any) => {
      console.log(stagioni);

      //Inseriemento delle stagioni nella cache
      stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
        this.apiService.cacheF1.stagioni.set(stagione.season, new Stagione(stagione.season));
      });

      //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
      if (this.apiService.cacheF1.stagioni.size < stagioni.MRData.total) {
        this.getTutteStagioniRicorsivo(offset + stagioni.MRData.SeasonTable.Seasons.length);
      }
      else if(this.apiService.cacheF1.stagioni.size == stagioni.MRData.total){
        this.apiService.cacheF1.stagBool = true;
      }
    });

    console.warn(this.apiService.cacheF1);
  }
  /**
   * Carica una singola stagione in cache
   * @param anno Anno della stagione da caricare
   */
  getStagione(anno: number): Stagione | undefined {
    //Controllo se la stagione è già in cache
    if (this.apiService.cacheF1.stagioni.has(anno)) {
      return this.apiService.cacheF1.stagioni.get(anno);
    }
    //Richiesta API per la stagione
    this.apiService.getDataF1Api(`https://ergast.com/api/f1/${anno}/seasons.json`, 0).subscribe((stagione: any) => {
      console.log(stagione);
      //Aggiunta della stagione alla cache
      this.apiService.cacheF1.stagioni.set(stagione.MRData.SeasonTable.Seasons[0].season, new Stagione(stagione.MRData.SeasonTable.Seasons[0].season));

      return this.getStagione(anno);
    });

    return undefined;
  }
}
