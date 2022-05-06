import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Circuito } from '../classi/circuito';
import { Gara } from '../classi/gara';
import { Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CircuitiService {

  constructor(private api: ApiService, private cache: CacheService) { }

  /**
   * Carica tutti i circuiti in cache
   */
  async getTuttiCircuiti(): Promise<Circuito[]> {
    if (!this.cache.circBool)
      await this.loadTuttiCircuitiRicorsivo(0);

    return Array.from(this.cache.circuiti.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i circuiti in cache
   * @param offset Scostamento dal primo circuito per la chiamata API
   */
  private async loadTuttiCircuitiRicorsivo(offset: number) {
    //Richiesta API per ottenere tutti i circuiti di F1
    const circuiti: any = await lastValueFrom(this.api.getDataF1Api('https://ergast.com/api/f1/circuits.json', offset));
    console.log(circuiti);

    //Richiesta API wiki per ottenere le immagini dei circuiti
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaVettoreGenerico(circuiti.MRData.CirtcuitTable.Circuits), this.api.imageSize));
    console.log(wikiData);

    //Inserimento dei circuiti nella cache
    circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {

      //Link dell'immagine del circuito
      let immagine: string | undefined;
      immagine = wikiData.query.pages[wikiData.query.pageids[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([circuito.url])[0], wikiData)]]?.thumbnail.source;
      if (immagine === undefined)
        immagine = this.api.placeholder;

      //Aggiunta del circuito alla cache
      this.cache.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
        circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

    });

    //Controllo se bisogna fare altre chiamate API
    if (this.cache.circuiti.size < circuiti.MRData.total) {
      this.loadTuttiCircuitiRicorsivo(offset + circuiti.MRData.CirtcuitTable.Circuits.length);
    } else if (this.cache.circuiti.size == circuiti.MRData.total) {
      this.cache.circBool = true;
    }

    console.warn(this.cache);
  }
  /**
   * Carica un singolo circuito in cache
   * @param id ID del circuito da caricare
   */
  async getCircuito(id: string): Promise<Circuito | undefined> {

    //Controllo se il circuito è già in cache
    if (this.cache.circuiti.has(id))
      return this.cache.circuiti.get(id);

    //Richiesta API per il circuito
    const circuito: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/circuits/${id}.json`, 0));
    console.log(circuito);

    //Richiesta API wiki per ottenere l'immagine del circuito
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([circuito.MRData.CircuitTable.Circuits[0].url]), this.api.imageSize));
    console.log(wikiData);

    //Link dell'immagine del circuito
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    if (immagine === undefined)
      immagine = this.api.placeholder;

    //Aggiunta del circuito alla cache
    this.cache.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
      circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

    return this.cache.circuiti.get(id);
  }


  /**
   * Carica tutte le gare di un circuito in cache
   * @param id ID del circuito
   * @returns Array contenente tutte le gare fatte sul circuito
   */
  async getGareCircuito(id: string) {
    //Prendo il circuito
    const circuito: Circuito | undefined = await this.getCircuito(id);
    if (circuito === undefined)
      throw new Error("Errore nel caricamento del circuito");

    //Prendo le gare
    if (!circuito.stagioniBool)
      await this.loadGareCircuitoRicorsivo(circuito, 0);

    //restituisce le gare fatte sul circuito
    return Array.from(circuito.vettoreStagioniGare.values()).sort((
      a: Gara, b: Gara) => b.stagione.anno - a.stagione.anno);;
  }
  /**
   * Metodo ricorsivo per caricare tutte le gare di un circuito in cache
   * @param circuito Circuito di cui prendere le gare
   * @param offset Scostamento dalla prima gara
   */
  private async loadGareCircuitoRicorsivo(circuito: Circuito, offset: number) {
    if (!circuito.stagioniBool) {
      //Richiesta API per ottenere le gare fatte sul circuito
      const gareCircuito: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/circuits/${circuito.id}/results/1.json`, offset));
      console.log(gareCircuito);

      //Inserisco le gare nella cache
      gareCircuito.MRData.RaceTable.Races.forEach(async (garaData: any) => {
        //Prendo la stagione
        let stagione: Stagione | undefined = this.cache.stagioni.get(garaData.season);
        //Se non è in cache lo aggiungo
        if(stagione === undefined) {
          stagione = new Stagione(garaData.season);
          this.cache.stagioni.set(stagione.anno, stagione);
        }
        //Prendo la gara
        let gara: Gara | undefined = stagione.gare.get(garaData.round);
        //Se non è in cache la aggiungo
        if(gara === undefined) {
          gara = new Gara(garaData.raceName, garaData.round, new Date(garaData.date), circuito, stagione);
          stagione.gare.set(gara.round, gara);
        }

        //Aggiungo la gara alla cache del circuito
        circuito.vettoreStagioniGare.set(gara.stagione.anno, gara);
      });

      //Controllo se devo fare altre richieste
      if (circuito.vettoreStagioniGare.size < gareCircuito.MRData.total) {
        this.loadGareCircuitoRicorsivo(circuito, offset + gareCircuito.MRData.RaceTable.Races.length);
      } else if (circuito.vettoreStagioniGare.size == gareCircuito.MRData.total) {
        circuito.stagioniBool = true;
      }
    }
  }
}
