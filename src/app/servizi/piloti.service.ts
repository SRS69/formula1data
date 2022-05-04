import { Injectable } from '@angular/core';
import { Pilota } from '../classi/pilota';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PilotiService {

  constructor(private apiService: ApiService) { 
  }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////PILOTI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Carica tutti i piloti in cache
   */
  getTuttiPiloti(): Array<Pilota> | undefined {
    this.getTuttiPilotiRicorsivo(0);
    
    //Controllo il booelano
    if (this.apiService.cacheF1.pilBool) {
      return Array.from(this.apiService.cacheF1.piloti.values());
    }
    return undefined;
  }
  /**
   * Metodo ricorsivo per caricare tutti i piloti in cache
   * @param offset Scostamento dal primo pilota per la chiamata API
   */
  private getTuttiPilotiRicorsivo(offset: number) {
    //Richiesta API per ottenere i piloti di F1
    this.apiService.getDataF1Api('https://ergast.com/api/f1/drivers.json', offset).subscribe((piloti: any) => {
      console.log(piloti);

      //Richiesta API wiki per ottenere le immagini di tutti i circuiti
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaVettoreGenerico(piloti.MRData.DriverTable.Drivers), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei piloti nella cache
        piloti.MRData.DriverTable.Drivers.forEach((pilota: any) => {

          //Link dell'immagine del pilota
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[this.apiService.wikiFromTitleToId(this.apiService.estraiTitoliDaUrls([pilota.url])[0], wikiData)]]?.thumbnail.source;
          if (immagine === undefined)
            immagine = this.apiService.placeholder;

          //Aggiunta del pilota alla cache
          this.apiService.cacheF1.piloti.set(pilota.driverId,
            new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));

        });

        //Controllo se bisogna fare altre richieste API
        if (this.apiService.cacheF1.piloti.size < piloti.MRData.total) {
          this.getTuttiPilotiRicorsivo(offset + piloti.MRData.DriverTable.Drivers.length);
        }
      });
    });
  }
  /**
   * Carica un singolo pilota in cache
   * @param id ID del pilota da caricare
   */
   getPilota(id: string): Pilota | undefined{

    //Controllo se è già in cache
    if (this.apiService.cacheF1.piloti.has(id)) {
      return this.apiService.cacheF1.piloti.get(id);
    }

    //Richiesta API per il pilota
    this.apiService.getDataF1Api(`https://ergast.com/api/f1/driver/${id}.json`, 0).subscribe((pilota: any) => {
      console.log(pilota);

      //Richiesta API per ottenere l'immagine del pilota
      this.apiService.getDataWikipedia(this.apiService.estraiTitoliDaUrls([pilota.MRData.DriverTable.Drivers[0].url]), this.apiService.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Link dell'immagine del pilota
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.apiService.placeholder;

        //Aggiunta del pilota alla cache
        this.apiService.cacheF1.piloti.set(pilota.driverId,
          new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth),
          pilota.nationality, pilota.permanentNumber, pilota.code));

        return this.getPilota(id);
      });
    });

    return undefined;
  }
}
