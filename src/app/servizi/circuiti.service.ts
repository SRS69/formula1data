import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CircuitiService {

  constructor(private apiService: ApiService) { }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////CIRCUITI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutti i circuiti in cache
   */
   getTuttiCircuiti() {
    this.getTuttiCircuitiRicorsivo(0);
  }
  /**
   * Metodo ricorsivo per caricare tutti i circuiti in cache
   * @param offset Scostamento dal primo circuito per la chiamata API
   */
  private getTuttiCircuitiRicorsivo(offset: number) {
    //Richiesta API per ottenere tutti i circuiti di F1
    this.apiService.getDataF1Api('https://ergast.com/api/f1/circuits.json', offset).subscribe((circuiti: any) => {
      console.log(circuiti);

      //Richiesta API wiki per ottenere le immagini dei circuiti
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaVettoreGenerico(circuiti.MRData.CirtcuitTable.Circuits), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei circuiti nella cache
        circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {

          //Link dell'immagine del circuito
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[this.apiService.wikiFromTitleToId(this.apiService.estraiTitoliDaUrls([circuito.url])[0], wikiData)]]?.thumbnail.source;
          if (immagine === undefined)
            immagine = this.apiService.placeholder;

          //Aggiunta del circuito alla cache
          this.apiService.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
            circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

        });

        //Controllo se bisogna fare altre chiamate API
        if (this.apiService.cacheF1.circuiti.size < circuiti.MRData.total) {
          this.getTuttiCircuitiRicorsivo(offset + circuiti.MRData.CirtcuitTable.Circuits.length);
        }
      });
    });

    console.warn(this.apiService.cacheF1);
  }
  /**
   * Carica un singolo circuito in cache
   * @param id ID del circuito da caricare
   */
  getCircuito(id: string) {
    //Richiesta API per il circuito
    this.apiService.getDataF1Api(`https://ergast.com/api/f1/circuits/${id}.json`, 0).subscribe((circuito: any) => {
      console.log(circuito);

      //Richiesta API wiki per ottenere l'immagine del circuito
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaUrls([circuito.MRData.CircuitTable.Circuits[0].url]), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Link dell'immagine del circuito
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.apiService.placeholder;

        //Aggiunta del circuito alla cache
        this.apiService.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
          circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
      });
    });
  }
}
