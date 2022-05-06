import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Gara, PostoGara, Tempo } from '../classi/gara';
import { Pilota } from '../classi/pilota';
import { PostoClassificaCostruttori, PostoClassificaPiloti, Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class StagioniService {

  constructor(private api: ApiService, private cache: CacheService) { }
  
  /**
   * Carica tutte le stagioni in cache
   * @returns Array contenente le stagioni presenti in cache
   */
  async getTutteStagioni(): Promise<Stagione[]> {
    if (!this.cache.stagBool)
      await this.loadTutteStagioniRicorsivo(0);

    //Restituisce le stagioni presenti in cache ordinate per anno
    return Array.from(this.cache.stagioni.values()).sort((a, b) => b.anno - a.anno);

  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni in cache
   * @param offset Scostamento dalla prima stagione per la chiamata API
   */
  private async loadTutteStagioniRicorsivo(offset: number) {
    if (!this.cache.stagBool) {
      //Richiesta API per ottenere le stagioni di F1 presenti dopo l'offset
      const stagioni: any = await lastValueFrom(this.api.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset));
      console.log(stagioni);

      //Inseriemento delle stagioni nella cache
      stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
        this.cache.stagioni.set(parseInt(stagione.season), new Stagione(parseInt(stagione.season)));
      });

      //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
      if (this.cache.stagioni.size < stagioni.MRData.total) {
        this.loadTutteStagioniRicorsivo(offset + stagioni.MRData.SeasonTable.Seasons.length);
      }
      //Aggiorno il booleano che indica che le stagioni sono tutte state caricate in cache
      else if (this.cache.stagioni.size == stagioni.MRData.total) {
        this.cache.stagBool = true;
      }

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


  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////GARE////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutte le gare dell'anno indicato in cache
   * @param anno Anno della stagione delle gare da caricare
   * @returns Array contenente le gare dell'anno richiesto presenti in cache
   */
  async getGareStagione(anno: number): Promise<Gara[]> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le gare
    if (!stagione.gareBool) {
      await this.loadGareStagioneRicorsivo(stagione, 0);
    }

    //Restituisco le gare sotto forma di Array ordinato crescentemente per round
    return Array.from(stagione.gare.values()).sort((a: Gara, b: Gara) => a.round - b.round);
  }
  /**
   * Metodo ricorsivo per caricare tutte le gare dell'anno indicato in cache
   * @param stagione Stagione di cui si vuole ottenere le gare
   * @param offset Scostamento dalla prima gara per la chiamata API
   */
  private async loadGareStagioneRicorsivo(stagione: Stagione, offset: number) {
    //Richiesta API per ottenere le gare della stagione
    const gare: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}.json`, offset))
    console.log(gare);

    //Inserimento delle gare nella cache
    gare.MRData.RaceTable.Races.forEach(async (gara: any) => {
      //const circuito: Circuito | undefined = await this.getCircuito(gara.Circuit.circuitId);
      //Prendo il circuito
      let circuito: Circuito | undefined = this.cache.circuiti.get(gara.Circuit.circuitId);
      //Se non c'è lo estraggo e lo aggiungo alla cache
      if (circuito === undefined) {
        //Richiesta API wiki per ottenere l'immagine del circuito
        const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([gara.Circuit.url]), this.api.imageSize));
        console.log(wikiData);

        //Link dell'immagine del circuito
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.api.placeholder;
          
        //Creazione del circuito
        circuito = new Circuito(gara.Circuit.circuitId, gara.Circuit.circuitName, immagine, gara.Circuit.Location.lat,
          gara.Circuit.Location.long, gara.Circuit.Location.locality, gara.Circuit.Location.country);

        //Aggiunta del circuito alla cache
        this.cache.circuiti.set(gara.Circuit.circuitId, circuito);
      }

      //Aggiunta della gara alla cache
      stagione.gare.set(parseInt(gara.round), new Gara(gara.raceName,
        parseInt(gara.round), new Date(gara.date + " " + gara.time), circuito, stagione));
    });

    //Controllo se bisogna fare altre richieste API
    if (stagione.gare.size < gare.MRData.total) {
      this.loadGareStagioneRicorsivo(stagione, offset + gare.MRData.RaceTable.Races.length)
    } else if (stagione.gare.size == gare.MRData.total) {
      stagione.gareBool = true;
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
    console.log(gara.RaceTable.Races[0]);

    //Prendo il circuito
    let circuito: Circuito | undefined = this.cache.circuiti.get(gara.RaceTable.Races[0].Circuit.circuitId);
      //Se non c'è lo estraggo e lo aggiungo alla cache
      if (circuito === undefined) {
        //Richiesta API wiki per ottenere l'immagine del circuito
        const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([gara.RaceTable.Races[0].Circuit.url]), this.api.imageSize));
        console.log(wikiData);

        //Link dell'immagine del circuito
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.api.placeholder;
          
        //Creazione del circuito
        circuito = new Circuito(gara.RaceTable.Races[0].Circuit.circuitId, gara.RaceTable.Races[0].Circuit.circuitName, immagine, gara.RaceTable.Races[0].Circuit.Location.lat,
          gara.RaceTable.Races[0].Circuit.Location.long, gara.RaceTable.Races[0].Circuit.Location.locality, gara.RaceTable.Races[0].Circuit.Location.country);

        //Aggiunta del circuito alla cache
        this.cache.circuiti.set(circuito.id, circuito);
      }

      //Aggiunta della gara alla cache
      stagione.gare.set(parseInt(gara.RaceTable.Races[0].round), new Gara(gara.RaceTable.Races[0].raceName,
        parseInt(gara.RaceTable.Races[0].round), new Date(gara.RaceTable.Races[0].date + " " + gara.RaceTable.Races[0].time), circuito, stagione));

    return stagione.gare.get(round);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////CLASSIFICA STAGIONE PILOTI//////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica dei piloti dell'anno richiesto
   * @param anno Anno della stagione della classifica
   * @returns Array contenente la classifica dei piloti dell'anno richiesto
   */
  async getClassificaPilotiStagione(anno: number): Promise<PostoClassificaPiloti[]> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le classifiche
    if (!stagione.classificaPilotiBool) {
      await this.loadClassificaPilotiStagioneRicorsivo(stagione, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(stagione.classificaPiloti.values()).sort((a: PostoClassificaPiloti, b: PostoClassificaPiloti) => b.punti - a.punti);
  }
  /**
   * Metodo ricorsivo che carica la classifica dei piloti dell'anno richiesto in cache
   * @param stagione Stagione della classifica
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private async loadClassificaPilotiStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaPilotiBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaPiloti: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione}/driverStandings.json`, offset));
      console.log(classificaPiloti);

      //Inserisco le posizioni nella cache
      classificaPiloti.MRData.StandingsTable.StandingsLists[0].DriverStandings.forEach(async (posizione: any) => {
        //Prendo il pilota
        let pilota: Pilota | undefined = this.cache.piloti.get(posizione.Driver.driverId);
        //Se non c'è lo estraggo e lo aggiungo alla cache
        if (pilota === undefined) {
          //Richiesta API wiki per ottenere l'immagine del pilota
          const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Driver.url]), this.api.imageSize));
          console.log(wikiData);

          //Link dell'immagine del pilota
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del pilota
          pilota = new Pilota(posizione.Driver.driverId, immagine, posizione.Driver.givenName, posizione.Driver.familyName,
            new Date(posizione.Driver.deteOfBirth), posizione.Driver.nationality, posizione.Driver?.permanentNumber, posizione.Driver?.code);

          //Aggiunta del pilota alla cache
          this.cache.piloti.set(pilota.id, pilota);
        }

        //Prendo il costruttore
        let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.Constructors[0].constructorId);
        //Se non c'è lo estraggo e lo aggiungo alla cache
        if (costruttore === undefined) {
          //Richiesta API wiki per ottenere l'immagine del costruttore
          const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructors[0].url]), this.api.imageSize));
          console.log(wikiData);

          //Link dell'immagine del costruttore
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del costruttore
          costruttore = new Costruttore(posizione.Constructors[0].constructorId, posizione.Constructors[0].name, immagine,
            posizione.Constructors[0].nationality);

          //Aggiunta del costruttore alla cache
          this.cache.costruttori.set(costruttore.id, costruttore);
        }

        //Aggiunta della posizione alla cache
        stagione.classificaPiloti.set(parseInt(posizione.position),
          new PostoClassificaPiloti(stagione, parseInt(posizione.position), parseInt(posizione.points),
            parseInt(posizione.wins), costruttore, pilota));
      });

      //Controllo se bisogna fare altre richieste API
      if (stagione.classificaPiloti.size < classificaPiloti.MRData.total) {
        this.loadClassificaPilotiStagioneRicorsivo(stagione, offset + classificaPiloti.MRData.StandingsTable.StandingsLists[0].DriverStandings.length)
      } else if (stagione.classificaPiloti.size == classificaPiloti.MRData.total) {
        stagione.classificaPilotiBool = true;
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////CLASSIFICA STAGIONE COSTRUTTORI/////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica dei costruttori dell'anno richiesto
   * @param anno Anno della stagione della classifica
   * @returns Array contenente la classifica dei costruttori dell'anno richiesto
   */
  async getClassificaCostruttoriStagione(anno: number): Promise<PostoClassificaCostruttori[]> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le classifiche
    if (!stagione.classificaCostruttoriBool) {
      await this.loadClassificaCostruttoriStagioneRicorsivo(stagione, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(stagione.classificaCostruttori.values()).sort((
      a: PostoClassificaCostruttori, b: PostoClassificaCostruttori) => b.punti - a.punti);
  }
  /**
   * Metodo ricorsivo che carica la classifica dei costruttori dell'anno richiesto in cache
   * @param stagione Stagione della classifica richiesta
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private async loadClassificaCostruttoriStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaCostruttoriBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaCostruttori: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${stagione}/constructorStandings.json`, offset));
      console.log(classificaCostruttori);

      //Inserisco le posizioni nella cache
      classificaCostruttori.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.forEach(async (posizione: any) => {
        //Prendo il costruttore
        let costruttore: Costruttore | undefined = await this.cache.costruttori.get(posizione.Constructor.constructorId);
        //Se non c'è lo estraggo e lo aggiungo alla cache
        if (costruttore === undefined) {
          //Richiesta API wiki per ottenere l'immagine del costruttore
          const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructor.url]), this.api.imageSize));
          console.log(wikiData);

          //Link dell'immagine del costruttore
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del costruttore
          costruttore = new Costruttore(posizione.Constructor.constructorId, posizione.Constructor.name, immagine,
            posizione.Constructor.nationality)

          //Aggiunta del costruttore alla cache
          this.cache.costruttori.set(costruttore.id, costruttore);
        }

        //Aggiunta della poiszione alla cache
        stagione.classificaCostruttori.set(parseInt(posizione.position),
          new PostoClassificaCostruttori(stagione, parseInt(posizione.position), parseInt(posizione.points),
            parseInt(posizione.wins), costruttore));
      });

      //Controllo se bisogna fare altre richieste API
      if (stagione.classificaCostruttori.size < classificaCostruttori.MRData.total) {
        this.loadClassificaCostruttoriStagioneRicorsivo(stagione, offset + classificaCostruttori.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.length)
      } else if (stagione.classificaCostruttori.size == classificaCostruttori.MRData.total) {
        stagione.classificaCostruttoriBool = true;
      }
    }
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////CLASSIFICA GARA/////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica la classifica della gara richiesta
   * @param anno Anno della stagione
   * @param round Round della gara
   * @returns Array contenente la classifica della gara richiesta
   */
  async getClassificaGara(anno: number, round: number): Promise<PostoGara[]> {
    //Prendo la stagione
    const gara: Gara | undefined = await this.getGaraStagione(anno, round);
    if (gara === undefined)
      throw new Error('Errore nel caricamento della gara');

    //Prendo le classifiche
    if (!gara.classificaGaraBool) {
      await this.loadClassificaGaraRicorsivo(gara, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(gara.classificaGara.values()).sort((a: PostoGara, b: PostoGara) => b.punti - a.punti);
  }
  /**
   * Metodo ricorsivo che carica la classifica della gara richiesta in cache
   * @param gara Gara di cui si vuole sapere la classifica
   * @param offset Scosatmento dalla prima posizione della classifica
   */
  private async loadClassificaGaraRicorsivo(gara: Gara, offset: number) {
    if (!gara.classificaGaraBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaGara: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/${gara.stagione.anno}/${gara.round}/results.json`, offset));
      console.log(classificaGara);

      //Inserisco le posizioni nella cache
      classificaGara.MRData.RaceTable.Races[0].Results.forEach(async (posizione: any) => {
        //Prendo il pilota
        let pilota: Pilota | undefined = this.cache.piloti.get(posizione.Driver.driverId);
        //Se non c'è lo estraggo e lo aggiungo alla cache
        if (pilota === undefined) {
          //Richiesta API wiki per ottenere l'immagine del pilota
          const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Driver.url]), this.api.imageSize));
          console.log(wikiData);

          //Link dell'immagine del pilota
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del pilota
          pilota = new Pilota(posizione.Driver.driverId, immagine, posizione.Driver.givenName, posizione.Driver.familyName,
            new Date(posizione.Driver.dateOfBirth), posizione.Driver.nationality, posizione.driver?.permanentNumber, posizione.driver?.code);

          //Aggiunta del pilota alla cache
          this.cache.piloti.set(pilota.id, pilota);
        }
        //Prendo il costruttore
        let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.Constructor.constructorId);
        if (costruttore === undefined) {
          //Richiesta API wiki per ottenere l'immagine del costruttore
          const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.Constructor.url]), this.api.imageSize));
          console.log(wikiData);

          //Link dell'immagine del costruttore
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del costruttore
          costruttore = new Costruttore(posizione.Constructor.constructorId, posizione.Constructor.name, immagine,
            posizione.Constructor.nazionality);

          //Aggiunta del costruttore alla cache
          this.cache.costruttori.set(costruttore.id, costruttore);
        }

        //Aggiunta della poiszione alla cache
        gara.classificaGara.set(parseInt(posizione.position),
          new PostoGara(parseInt(posizione.position), pilota, costruttore, parseInt(posizione.laps),
            parseInt(posizione.grid), parseInt(posizione.points), (posizione.status == "Finished"),
            gara, new Tempo(posizione.Time?.millis)));
      });

      //Controllo se bisogna fare altre richieste API
      if (gara.classificaGara.size < classificaGara.MRData.total) {
        this.loadClassificaGaraRicorsivo(gara, offset + classificaGara.MRData.RaceTable.Races[0].Results.length);
      } else if (gara.classificaGara.size == classificaGara.MRData.total) {
        gara.classificaGaraBool = true;
      }

    }
  }

}
