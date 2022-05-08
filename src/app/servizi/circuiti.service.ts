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
  getTuttiCircuiti(): Map<string, Circuito> {
    if (!this.cache.circBool)
      this.loadTuttiCircuitiRicorsivo(0);

    return this.cache.circuiti;
    //return Array.from(this.cache.circuiti.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i circuiti in cache
   * @param offset Scostamento dal primo circuito per la chiamata API
   */
  private loadTuttiCircuitiRicorsivo(offset: number) {
    if (!this.cache.circBool) {
      //Richiesta API per ottenere tutti i circuiti di F1
      this.api.getDataF1Api('https://ergast.com/api/f1/circuits.json', offset).subscribe((circuiti: any) => {
        console.log(circuiti);

        //Richiesta API wiki per ottenere le immagini dei circuiti
        const urls: string[] = this.api.estraiTitoliDaVettoreGenerico(circuiti.MRData.CircuitTable.Circuits);
        this.api.getDataWikipedia(urls, this.api.imageSize).subscribe((wikiData: any) => {
          console.log(wikiData);

          //Inserimento dei circuiti nella cache
          circuiti.MRData.CircuitTable.Circuits.forEach((circuito: any) => {


            //for (let i = 0; i < circuiti.MRData.CircuitTable.Circuits.length; i++) {
            //  const circuito: any = circuiti.MRData.CircuitTable?.Circuits[i];


            //circuiti.MRData.CircuitTable?.Circuits.forEach((circuito: any) => {
            //Link dell'immagine del circuito
            if(circuito.circuitId == "monza")
              console.log("sus");
            const idPagina: number = this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([circuito.url])[0], wikiData);
            let immagine: string | undefined = wikiData.query.pages[idPagina]?.thumbnail?.source;
            //immagine = wikiData.query.pages[wikiData.query.pageids[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([circuito.url])[0], wikiData)]]?.thumbnail?.source;
            if (immagine === undefined)
              immagine = this.api.placeholder;

            //Aggiunta del circuito alla cache
            this.cache.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
              circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
          });
          //}

          //Controllo se bisogna fare altre chiamate API
          if (this.cache.circuiti.size < circuiti.MRData.total) {
            this.loadTuttiCircuitiRicorsivo(offset + circuiti.MRData.CircuitTable?.Circuits.length);
          } else if (this.cache.circuiti.size == circuiti.MRData.total) {
            this.cache.circBool = true;
          }
        });
      });
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
    immagine = wikiData.query.pages[wikiData.query.pageids[0]]?.thumbnail?.source;
    if (immagine === undefined)
      immagine = this.api.placeholder;

    const tmpCircuito: Circuito = new Circuito(circuito.MRData.CircuitTable.Circuits[0].circuitId,
      circuito.MRData.CircuitTable.Circuits[0].circuitName, immagine, circuito.MRData.CircuitTable.Circuits[0].Location.lat,
      circuito.MRData.CircuitTable.Circuits[0].Location.long, circuito.MRData.CircuitTable.Circuits[0].Location.locality,
      circuito.MRData.CircuitTable.Circuits[0].Location.country);

    //Aggiunta del circuito alla cache
    this.cache.circuiti.set(tmpCircuito.id, tmpCircuito);

    return this.cache.circuiti.get(id);
  }


  /**
   * Carica tutte le gare di un circuito in cache
   * @param id ID del circuito
   * @returns Array contenente tutte le gare fatte sul circuito
   */
  async getGareCircuito(id: string): Promise<Map<number, Gara>> {
    //Prendo il circuito
    const circuito: Circuito | undefined = await this.getCircuito(id);
    if (circuito === undefined)
      throw new Error("Errore nel caricamento del circuito");

    //Prendo le gare
    if (!circuito.stagioniBool)
      this.loadGareCircuitoRicorsivo(circuito, 0);

    return circuito.vettoreStagioniGare;
    //restituisce le gare fatte sul circuito
    // return Array.from(circuito.vettoreStagioniGare.values()).sort((
    //   a: Gara, b: Gara) => b.stagione.anno - a.stagione.anno);;
  }
  /**
   * Metodo ricorsivo per caricare tutte le gare di un circuito in cache
   * @param circuito Circuito di cui prendere le gare
   * @param offset Scostamento dalla prima gara
   */
  private loadGareCircuitoRicorsivo(circuito: Circuito, offset: number) {
    if (!circuito.stagioniBool) {
      //Richiesta API per ottenere le gare fatte sul circuito
      this.api.getDataF1Api(`https://ergast.com/api/f1/circuits/${circuito.id}/results/1.json`, offset).subscribe((gareCircuito: any) => {
        console.log(gareCircuito);

        //Inserisco le gare nella cache
        gareCircuito.MRData.RaceTable.Races.forEach(async (garaData: any) => {
          //Prendo la stagione
          let stagione: Stagione | undefined = this.cache.stagioni.get(garaData.season);
          //Se non è in cache lo aggiungo
          if (stagione === undefined) {
            stagione = new Stagione(garaData.season);
            this.cache.stagioni.set(stagione.anno, stagione);
          }
          //Prendo la gara
          let gara: Gara | undefined = stagione.gare.get(garaData.round);
          //Se non è in cache la aggiungo
          if (gara === undefined) {
            gara = new Gara(garaData.raceName, garaData.round, new Date(garaData.date), circuito, stagione);
            stagione.gare.set(gara.round, gara);
          }

          //Aggiungo la gara alla cache del circuito
          circuito.vettoreStagioniGare.set(gara.stagione.anno, gara);
        });

        //Controllo se devo fare altre richieste
        if (circuito.vettoreStagioniGare.size < gareCircuito.MRData.total && gareCircuito.MRData.RaceTable.Races.length!=0) {
          this.loadGareCircuitoRicorsivo(circuito, offset + gareCircuito.MRData.RaceTable.Races.length);
        } else if (circuito.vettoreStagioniGare.size == gareCircuito.MRData.total) {
          circuito.stagioniBool = true;
        }
      });
    }
  }

  async completaCircuito(id: string): Promise<Circuito> {
    //Prendo il circuito
    const circuito: Circuito | undefined = await this.getCircuito(id);
    if (circuito === undefined)
      throw new Error("Errore nel caricamento del circuito");

    //Prendo le gare
    this.getGareCircuito(circuito.id);

    return circuito;
  }
}
