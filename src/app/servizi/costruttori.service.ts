import { Injectable } from '@angular/core';
import { Costruttore } from '../classi/costruttore';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CostruttoriService {

  constructor(private apiService: ApiService) { }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////COSTRUTTORI////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutti i costruttori in cache
   */
   getTuttiCostruttori() {
    this.getTuttiCostruttoriRicorsivo(0);
  }
  /**
   * Metodo ricorsivo per caricare tutti i costruttori in cache
   * @param offset Scostamento dal primo costruttore per la chiamata API
   */
  private getTuttiCostruttoriRicorsivo(offset: number) {
    //Richiesta API per ottenere i costruttori di F1
    this.apiService.getDataF1Api('https://ergast.com/api/f1/constructors.json', offset).subscribe((costruttori: any) => {
      console.log(costruttori);

      //Richiesta API wiki per ottenere le immagini di tutti i circuiti
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaVettoreGenerico(costruttori.MRData.ConstructorTable.Constructors), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei costruttori nella cache
        costruttori.MRData.ConstructorTable.Constructors.forEach((costruttore: any) => {

          //Link dell'immagine del costruttore
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[this.apiService.wikiFromTitleToId(this.apiService.estraiTitoliDaUrls([costruttore.url])[0], wikiData)]]?.thumbnail.source;
          if (immagine === undefined)
            immagine = this.apiService.placeholder;

          //Aggiunta del costruttore alla cache
          this.apiService.cacheF1.costruttori.set(costruttore.constructorId,
            new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
        });

        //Controllo se bisogna fare altre richieste API
        if (this.apiService.cacheF1.costruttori.size < costruttori.MRData.total) {
          this.getTuttiCostruttoriRicorsivo(offset + costruttori.MRData.ConstructorTable.Constructors.length);
        }
      });
    });
  }
  /**
   * Carica un singolo costruttore in cache
   * @param id ID del costruttore da caricare
   */
   getCostruttore(id: string) {
    //Richiesta API per il costruttore
    this.apiService.getDataF1Api(`https://ergast.com/api/f1/constructors/${id}.json`, 0).subscribe((costruttore: any) => {
      console.log(costruttore);

      //Richiesta API per ottenere l'immagine del costruttore
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaUrls([costruttore.MRData.ConstructorTable.Constructors[0].url]), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Link dell'immagine del costruttore
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.apiService.placeholder;

        //Aggiunta del costruttore alla cache
        this.apiService.cacheF1.costruttori.set(costruttore.constructorId,
          new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
      });
    });
  }
}
