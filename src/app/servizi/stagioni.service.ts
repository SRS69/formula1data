import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Gara, PostoGara, Tempo } from '../classi/gara';
import { Pilota } from '../classi/pilota';
import { PostoClassificaCostruttori, PostoClassificaPiloti, Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService, MapNO } from './cache.service';

/**
 * Servizio per richiedere i dati riguardanti le stagioni e le gare di F1
 */
@Injectable({
  providedIn: 'root'
})
export class StagioniService {

  constructor(private api: ApiService, private cache: CacheService) {
  }

  /**
   * Carica tutte le stagioni in cache
   * @returns Mappa contenente le stagioni presenti in cache
   */
  getTutteStagioni(): MapNO<number, Stagione> {
    //Controlla se bisogna caricare le stagioni in cache
    if (!this.cache.stagBool)
      this.loadTutteStagioniRicorsivo(0);

    //Restituisce le stagioni presenti in cache ordinate per anno
    return this.cache.stagioni;
  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni in cache
   * @param offset Scostamento dalla prima stagione per la chiamata API
   */
  private loadTutteStagioniRicorsivo(offset: number) {
    if (!this.cache.stagBool) {
      //Richiesta API per ottenere le stagioni di F1 presenti dopo l'offset
      this.api.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset).subscribe((stagioni: any) => {
        console.log(stagioni);

        //Inseriemento delle stagioni nella cache
        stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
          this.cache.stagioni.set(parseInt(stagione.season), new Stagione(parseInt(stagione.season)));
        });
        //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
        if (this.cache.stagioni.size < stagioni.MRData.total && stagioni.MRData.SeasonTable.Seasons.length > 0) {
          this.loadTutteStagioniRicorsivo(offset + stagioni.MRData.SeasonTable.Seasons.length);
        } else {
          this.cache.stagBool = true;
        }
      });
    }
    console.warn(this.cache);
  }
  /**
   * Carica una singola stagione in cache
   * @param anno Anno della stagione da caricare 
   * @returns Stagione richiesta
   */
  async getStagione(anno: number): Promise<Stagione | undefined> {
    //Controllo se la stagione è già in cache
    if (this.cache.stagioni.has(anno)) {
      return this.cache.stagioni.get(anno);
    }

    //Richiesta API per la stagione (aspette che arrivi la risposta)
    const stagione: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${anno}/seasons.json`, 0));
    console.log(stagione);

    //Aggiunta della stagione alla cache
    this.cache.stagioni.set(parseInt(stagione.MRData.SeasonTable.Seasons[0].season), new Stagione(parseInt(stagione.MRData.SeasonTable.Seasons[0].season)));

    return this.cache.stagioni.get(anno);
  }
  /**
   * Restituisce la stagione di F1 corrente
   * @returns Stagione corrente
   */
  async getStagioneCorrente(): Promise<Stagione | undefined> {
    //Richiesta API
    const stagioneApi: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/current/seasons.json`, 0));

    const stagione: Stagione = new Stagione(parseInt(stagioneApi.MRData.SeasonTable.Seasons[0].season));
    //Aggiunta della stagione alla cache
    this.cache.stagioni.set(stagione.anno, stagione);

    return this.cache.stagioni.get(stagione.anno);
  }



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////GARE////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutte le gare dell'anno richiesto in cache
   * @param anno Anno della stagione delle gare da caricare
   * @returns Mappa contenente le gare dell'anno richiesto
   */
  async getGareStagione(anno: number): Promise<MapNO<number, Gara>> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le gare
    if (!stagione.gareBool) {
      this.loadGareStagioneRicorsivo(stagione, 0);
    }

    return stagione.gare;
  }
  /**
   * Metodo ricorsivo per caricare  in cache tutte le gare dell'anno richiesto
   * @param stagione Stagione di cui si vuole ottenere le gare
   * @param offset Scostamento dalla prima gara per la chiamata API
   */
  private loadGareStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.gareBool) {
      //Richiesta API per ottenere le gare della stagione
      this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}.json`, offset).subscribe(async (gare: any) => {
        console.log(gare);

        //Inserimento delle gare nella cache
        gare.MRData.RaceTable.Races.forEach(async (gara: any) => {
          if (!stagione.gare.has(parseInt(gara.round))) {
            //Prendo il circuito
            let circuito: Circuito | undefined = this.cache.circuiti.get(gara.Circuit.circuitId);
            //Se non c'è lo estraggo e lo aggiungo alla cache
            if (circuito === undefined) {
              //Richiesta API wiki per ottenere l'immagine del circuito
              const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(["List_of_Formula_One_circuits"], this.api.imageSize));
              console.log(wikiData);
              //Link dell'immagine del circuito
              let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], 
                ((gara.Circuit.circuitId).replace("_", "&")+"&"+gara.Circuit.circuitName+"&"+gara.Circuit.Location.locality+"&"+gara.Circuit.Location.country).split("&"));
              //Creazione del circuito
              circuito = new Circuito(gara.Circuit.circuitId, gara.Circuit.circuitName, immagine, gara.Circuit.Location.lat,
                gara.Circuit.Location.long, gara.Circuit.Location.locality, gara.Circuit.Location.country);

              //Aggiunta del circuito alla cache
              this.cache.circuiti.set(circuito.id, circuito);

              circuito = this.cache.circuiti.get(circuito.id);
              if (!circuito)
                throw new Error('Errore nel caricamento del circuito');
            }
            //Aggiunta della gara alla cache
            stagione.gare.set(parseInt(gara.round), new Gara(gara.raceName,
              parseInt(gara.round), new Date(gara.date + " " + gara.time), circuito, stagione));
          }
        });

        //Controllo se bisogna fare altre richieste API
        if (stagione.gare.size < gare.MRData.total && gare.MRData.RaceTable.Races.length > 0) {
          this.loadGareStagioneRicorsivo(stagione, offset + gare.MRData.RaceTable.Races.length)
        } else {
          stagione.gareBool = true;
        }
      });
    }

    console.warn(stagione);
  }
  /**
   * Carica una singola gara in cache
   * @param anno Anno della stagione della gara
   * @param round Numero del round della gara
   * @returns Gara richiesta
   */
  async getGaraStagione(anno: number, round: number): Promise<Gara | undefined> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Controllo se la gara è già in cache
    if (stagione.gare.has(round))
      return stagione.gare.get(round);

    //Richiesta API per ottenere la gara
    const gara: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}/${round}.json`, 0))

    //Prendo il circuito
    let circuito: Circuito | undefined = this.cache.circuiti.get(gara.MRData.RaceTable.Races[0].Circuit.circuitId);
    //Se non c'è lo estraggo e lo aggiungo alla cache
    if (circuito === undefined) {
      //Richiesta API wiki per ottenere l'immagine del circuito
      const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(["List_of_Formula_One_circuits"], this.api.imageSize));
      console.log(wikiData);
      //Link dell'immagine del circuito
      let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]],
        ((gara.MRData.RaceTable.Races[0].Circuit.circuitId).replace("_", "&")+"&"+gara.MRData.RaceTable.Races[0].Circuit.circuitName+"&"+gara.MRData.RaceTable.Races[0].Circuit.Location.locality+"&"+gara.MRData.RaceTable.Races[0].Circuit.Location.country).split("&"));
      //Creazione del circuito
      circuito = new Circuito(gara.MRData.RaceTable.Races[0].Circuit.circuitId, gara.MRData.RaceTable.Races[0].Circuit.circuitName, immagine, gara.MRData.RaceTable.Races[0].Circuit.Location.lat,
        gara.MRData.RaceTable.Races[0].Circuit.Location.long, gara.MRData.RaceTable.Races[0].Circuit.Location.locality, gara.MRData.RaceTable.Races[0].Circuit.Location.country);

      //Aggiunta del circuito alla cache
      this.cache.circuiti.set(circuito.id, circuito);
      circuito = this.cache.circuiti.get(circuito.id);
      if (!circuito)
        throw new Error('Errore nel caricamento del circuito');
    }
    //Aggiunta della gara alla cache
    stagione.gare.set(parseInt(gara.MRData.RaceTable.Races[0].round), new Gara(gara.MRData.RaceTable.Races[0].raceName,
      parseInt(gara.MRData.RaceTable.Races[0].round), new Date(gara.MRData.RaceTable.Races[0].date + " " + gara.MRData.RaceTable.Races[0].time), circuito, stagione));

    console.log(stagione)
    return stagione.gare.get(round);
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////CLASSIFICA STAGIONE PILOTI//////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica dei piloti dell'anno richiesto
   * @param anno Anno della stagione della classifica
   * @returns Mappa contenente la classifica dei piloti dell'anno richiesto
   */
  async getClassificaPilotiStagione(anno: number): Promise<MapNO<number, PostoClassificaPiloti>> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo la classifica
    if (!stagione.classificaPilotiBool) {
      this.loadClassificaPilotiStagioneRicorsivo(stagione, 0);
    }

    return stagione.classificaPiloti;
  }
  /**
   * Metodo ricorsivo che carica la classifica dei piloti dell'anno richiesto in cache
   * @param stagione Stagione di cui si vuole la classifica
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private loadClassificaPilotiStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaPilotiBool) {
      //Faccio la richiesta API per ottenere la classifica
      this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}/driverStandings.json`, offset).subscribe((classificaPiloti: any) => {
        console.log(classificaPiloti);

        //Inserisco le posizioni nella cache
        classificaPiloti.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.forEach(async (posizione: any) => {
          //Prendo il pilota
          let pilota: Pilota | undefined = this.cache.piloti.get(posizione.Driver.driverId);
          //Se non c'è lo estraggo e lo aggiungo alla cache
          if (pilota === undefined) {
            //Richiesta API wiki per ottenere l'immagine del pilota
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Driver.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del pilota
            let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [posizione.Driver.familyName]);
            //Creazione del pilota
            pilota = new Pilota(posizione.Driver.driverId, immagine, posizione.Driver.givenName, posizione.Driver.familyName,
              new Date(posizione.Driver.dateOfBirth), posizione.Driver.nationality, posizione.Driver?.permanentNumber, posizione.Driver?.code);
            //Aggiunta del pilota alla cache
            this.cache.piloti.set(pilota.id, pilota);
            pilota = this.cache.piloti.get(pilota.id);
            if (!pilota)
              throw new Error('Errore nel caricamento del pilota');
          }

          //Prendo il costruttore
          let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.Constructors[0].constructorId);
          //Se non c'è lo estraggo e lo aggiungo alla cache
          if (costruttore === undefined) {
            //Richiesta API wiki per ottenere l'immagine del costruttore
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructors[0].url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del costruttore
            let immagine: string = this.api.getImageUrlFromPage(wikiData.query?.pages[wikiData.query.pageids[0]], [posizione.Constructors[0].constructorId, "logo"]);
            //Creazione del costruttore
            costruttore = new Costruttore(posizione.Constructors[0].constructorId, posizione.Constructors[0].name, immagine,
              posizione.Constructors[0].nationality);
            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.id, costruttore);
            costruttore = this.cache.costruttori.get(costruttore.id);
            if (!costruttore)
              throw new Error('Errore nel caricamento del costruttore');
          }

          //Aggiunta della posizione alla cache
          stagione.classificaPiloti.set(parseInt(posizione.position),
            new PostoClassificaPiloti(stagione, parseInt(posizione.position), parseInt(posizione.points),
              parseInt(posizione.wins), costruttore, pilota));
        });
        //Controllo se bisogna fare altre richieste API
        if (stagione.classificaPiloti.size < classificaPiloti.MRData.total && classificaPiloti.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.length > 0) {
          this.loadClassificaPilotiStagioneRicorsivo(stagione, offset + classificaPiloti.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.length)
        } else {
          stagione.classificaPilotiBool = true;
        }
      });
    }
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////CLASSIFICA STAGIONE COSTRUTTORI/////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica dei costruttori dell'anno richiesto
   * @param anno Anno della stagione della classifica
   * @returns Mappa contenente la classifica dei costruttori dell'anno richiesto
   */
  async getClassificaCostruttoriStagione(anno: number): Promise<MapNO<number, PostoClassificaCostruttori>> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le classifiche
    if (!stagione.classificaCostruttoriBool) {
      this.loadClassificaCostruttoriStagioneRicorsivo(stagione, 0);
    }

    return stagione.classificaCostruttori
  }
  /**
   * Metodo ricorsivo che carica la classifica dei costruttori dell'anno richiesto in cache
   * @param stagione Stagione della classifica richiesta
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private loadClassificaCostruttoriStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaCostruttoriBool) {
      //Faccio la richiesta API per ottenere la classifica
      this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}/constructorStandings.json`, offset).subscribe((classificaCostruttori: any) => {
        console.log(classificaCostruttori);

        //Inserisco le posizioni nella cache
        classificaCostruttori.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.forEach(async (posizione: any) => {
          //Prendo il costruttore
          let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.Constructor.constructorId);
          //Se non c'è lo estraggo e lo aggiungo alla cache
          if (costruttore === undefined) {
            //Richiesta API wiki per ottenere l'immagine del costruttore
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructor.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del costruttore
            let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [posizione.Constructor.constructorId, "logo"]);
            //Creazione del costruttore
            costruttore = new Costruttore(posizione.Constructor.constructorId, posizione.Constructor.name, immagine,
              posizione.Constructor.nationality)
            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.id, costruttore);
            costruttore = this.cache.costruttori.get(costruttore.id);
            if (!costruttore)
              throw new Error('Errore nel caricamento del costruttore');
          }

          //Aggiunta della poiszione alla cache
          stagione.classificaCostruttori.set(parseInt(posizione.position),
            new PostoClassificaCostruttori(stagione, parseInt(posizione.position), parseInt(posizione.points),
              parseInt(posizione.wins), costruttore));
        });

        //Controllo se bisogna fare altre richieste API
        if (stagione.classificaCostruttori.size < classificaCostruttori.MRData.total && classificaCostruttori.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.length > 0) {
          this.loadClassificaCostruttoriStagioneRicorsivo(stagione, offset + classificaCostruttori.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.length)
        } else {
          stagione.classificaCostruttoriBool = true;
        }
      });
    }
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////CLASSIFICA GARA/////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica della gara richiesta
   * @param anno Anno della stagione
   * @param round Round della gara
   * @returns Mappa contenente la classifica della gara richiesta
   */
  async getClassificaGara(anno: number, round: number): Promise<MapNO<number, PostoGara>> {
    //Prendo la stagione
    const gara: Gara | undefined = await this.getGaraStagione(anno, round);
    if (gara === undefined)
      throw new Error('Errore nel caricamento della gara');

    //Prendo le classifiche
    if (!gara.classificaGaraBool) {
      this.loadClassificaGaraRicorsivo(gara, 0);
    }

    return gara.classificaGara;
  }
  /**
   * Metodo ricorsivo che carica la classifica della gara richiesta in cache
   * @param gara Gara di cui si vuole sapere la classifica
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private loadClassificaGaraRicorsivo(gara: Gara, offset: number) {
    if (!gara.classificaGaraBool) {
      //Faccio la richiesta API per ottenere la classifica
      this.api.getDataF1Api(`https://ergast.com/api/f1/${gara.stagione.anno}/${gara.round}/results.json`, offset).subscribe((classificaGara: any) => {
        console.log(classificaGara);

        //Inserisco le posizioni nella cache
        classificaGara.MRData.RaceTable.Races[0]?.Results.forEach(async (posizione: any) => {
          //Prendo il pilota
          let pilota: Pilota | undefined = this.cache.piloti.get(posizione.Driver.driverId);
          //Se non c'è lo estraggo e lo aggiungo alla cache
          if (pilota === undefined) {
            //Richiesta API wiki per ottenere l'immagine del pilota
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Driver.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del pilota
            let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [posizione.Driver.familyName]);
            //Creazione del pilota
            pilota = new Pilota(posizione.Driver.driverId, immagine, posizione.Driver.givenName, posizione.Driver.familyName,
              new Date(posizione.Driver.dateOfBirth), posizione.Driver.nationality, posizione.driver?.permanentNumber, posizione.driver?.code);
            //Aggiunta del pilota alla cache
            this.cache.piloti.set(pilota.id, pilota);
            pilota = this.cache.piloti.get(pilota.id);
            if (!pilota)
              throw new Error('Errore nel caricamento del pilota');
          }

          //Prendo il costruttore
          let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.Constructor.constructorId);
          if (costruttore === undefined) {
            //Richiesta API wiki per ottenere l'immagine del costruttore
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructor.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del costruttore
            let immagine: string = this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [posizione.Constructor.constructorId, "logo"]);
            //Creazione del costruttore
            costruttore = new Costruttore(posizione.Constructor.constructorId, posizione.Constructor.name, immagine,
              posizione.Constructor.nazionality);
            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.id, costruttore);
            costruttore = this.cache.costruttori.get(costruttore.id);
            if (!costruttore)
              throw new Error('Errore nel caricamento del costruttore');
          }

          let tempo: Tempo | undefined;
          posizione.Time?.millis ? tempo = Tempo.daMillisecondi(parseInt(posizione.Time.millis)) : tempo = undefined;
          //Aggiunta della poiszione alla cache
          gara.classificaGara.set(parseInt(posizione.position),
            new PostoGara(parseInt(posizione.position), pilota, costruttore, parseInt(posizione.laps),
              parseInt(posizione.grid), parseInt(posizione.points), (posizione.status == "Finished"),
              gara, tempo));
        });

        //Controllo se bisogna fare altre richieste API
        if (gara.classificaGara.size < classificaGara.MRData.total && classificaGara.MRData.RaceTable.Races[0]?.Results.length > 0) {
          this.loadClassificaGaraRicorsivo(gara, offset + classificaGara.MRData.RaceTable.Races[0]?.Results.length);
        } else {
          gara.classificaGaraBool = true;
        }
      });

    }
  }

  /**
   * Restituisce la stagione richiesta completata
   * @param anno Anno della stagione da completare
   * @returns Stagione completa
   */
  async completaStagione(anno: number): Promise<Stagione> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Carico le gare
    this.getGareStagione(stagione.anno);

    //Carico le classifiche della stagione
    this.getClassificaPilotiStagione(stagione.anno);
    this.getClassificaCostruttoriStagione(stagione.anno);
    //Carico le classifiche delle gare
    stagione.gare.forEach(gara => {
      this.getClassificaGara(stagione.anno, gara.round);
    });

    return stagione;
  }
}


