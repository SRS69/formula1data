import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Circuito } from '../classi/circuito';
import { Gara } from '../classi/gara';
import { Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService, MapNO } from './cache.service';

/**
 * Servizio per richiedere i dati riguardanti i circuiti di F1
 */
@Injectable({
  providedIn: 'root'
})
export class CircuitiService {

  constructor(private api: ApiService, private cache: CacheService) { }

  /**
   * Carica tutti i circuiti in cache
   * @returns Mappa conetenente tutti i circuiti
   */
  getTuttiCircuiti(): MapNO<string, Circuito> {
    if (!this.cache.circBool)
      this.loadTuttiCircuitiRicorsivo(0);

    return this.cache.circuiti;
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
        //const urls: string[] = this.api.estraiTitoliDaVettoreGenerico(circuiti.MRData.CircuitTable.Circuits);
        this.api.getDataWikipedia(["List_of_Formula_One_circuits"], this.api.imageSize).subscribe((wikiData: any) => {
          console.log(wikiData);

          //Inserimento dei circuiti nella cache
          circuiti.MRData.CircuitTable.Circuits.forEach((circuito: any) => {
            if (!this.cache.circuiti.has(circuito.circuitId)) {
              //Link dell'immagine del circuito
              let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]],
                ((circuito.circuitId).replace("_", "&")+"&"+(circuito.circuitName+"&"+circuito.Location.locality+"&"+circuito.Location.country).replace(" ", "&")).split("&"));
              //Aggiunta del circuito alla cache
              this.cache.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
                parseInt(circuito.Location.lat), parseInt(circuito.Location.long), circuito.Location.locality, circuito.Location.country));
            }
          });

          //Controllo se bisogna fare altre chiamate API
          if (this.cache.circuiti.size < circuiti.MRData.total && circuiti.MRData.CircuitTable.Circuits.length > 0) {
            this.loadTuttiCircuitiRicorsivo(offset + circuiti.MRData.CircuitTable.Circuits.length);
          } else {
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
   * @returns Il circuito richiesto
   */
  async getCircuito(id: string): Promise<Circuito | undefined> {
    //Controllo se il circuito è già in cache
    if (this.cache.circuiti.has(id))
      return this.cache.circuiti.get(id);

    //Richiesta API per il circuito
    const circuito: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/circuits/${id}.json`, 0));
    console.log(circuito);

    //Richiesta API wiki per ottenere l'immagine del circuito
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(["List_of_Formula_One_circuits"], this.api.imageSize));
    console.log(wikiData);
    //Link dell'immagine del circuito
    let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]],
      ((circuito.MRData.CircuitTable.Circuits[0].circuitId).replace("_", "&")+"&"+(circuito.MRData.CircuitTable.Circuits[0].circuitName+"&"+circuito.MRData.CircuitTable.Circuits[0].Location.locality+"&"+circuito.MRData.CircuitTable.Circuits[0].Location.country).replace(" ", "&")).split("&"));

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
   * @returns Mappa contenente tutte le gare fatte sul circuito
   */
  async getGareCircuito(id: string): Promise<MapNO<number, Gara>> {
    //Prendo il circuito
    const circuito: Circuito | undefined = await this.getCircuito(id);
    if (circuito === undefined)
      throw new Error("Errore nel caricamento del circuito");

    //Prendo le gare
    if (!circuito.stagioniBool)
      this.loadGareCircuitoRicorsivo(circuito, 0);

    return circuito.vettoreStagioniGare;
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
          let stagione: Stagione | undefined = this.cache.stagioni.get(parseInt(garaData.season));
          //Se non è in cache lo aggiungo
          if (stagione === undefined) {
            stagione = new Stagione(parseInt(garaData.season));
            this.cache.stagioni.set(stagione.anno, stagione);

            stagione = this.cache.stagioni.get(stagione.anno);
            if(!stagione)
              throw new Error("Errore nel caricamento della stagione");
          }
          //Prendo la gara
          let gara: Gara | undefined = stagione.gare.get(parseInt(garaData.round));
          //Se non è in cache la aggiungo
          if (gara === undefined) {
            gara = new Gara(garaData.raceName, parseInt(garaData.round), new Date(garaData.date), circuito, stagione);
            stagione.gare.set(gara.round, gara);
          }

          //Aggiungo la gara alla cache del circuito
          circuito.vettoreStagioniGare.set(gara.stagione.anno, gara);
        });

        //Controllo se devo fare altre richieste
        if (circuito.vettoreStagioniGare.size < gareCircuito.MRData.total && gareCircuito.MRData.RaceTable.Races.length != 0) {
          this.loadGareCircuitoRicorsivo(circuito, offset + gareCircuito.MRData.RaceTable.Races.length);
        } else if (circuito.vettoreStagioniGare.size == gareCircuito.MRData.total) {
          circuito.stagioniBool = true;
        }
      });
    }
  }

  /**
   * Completa il circuito richiesto
   * @param id ID del circuito da completare
   * @returns Circuito richiesto completato
   */
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
