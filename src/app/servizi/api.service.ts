import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { Circuito } from '../classi/circuito';
import { Tempo } from '../classi/classifica';
import { Costruttore } from '../classi/costruttore';
import { Gara, PostoGara, PostoQualifica } from '../classi/gara';
import { Pilota } from '../classi/pilota';
import { PostoClassificaCostruttori, PostoClassificaPiloti, Stagione } from '../classi/stagione';
import { StagioniService } from './stagioni.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //Limite di dati per ogni richiesta F1
  readonly limit: number;
  //Link immagine placeholder
  readonly placeholder: string;
  //Grandezza delle immagini di wikipedia
  readonly imageSize: number;
  //Cache contenente i dati richiesti
  private cacheF1: CacheF1;

  constructor(private http: HttpClient) {
    /*
    MAX --> 50 per ottimizzre le richieste wikipedia
    */
    this.limit = 50;
    this.placeholder = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    this.imageSize = 500;
    this.cacheF1 = new CacheF1();
    this.ricorsioneStagioni = false;
    this.ricorsioneCircuiti = false;
    this.ricorsionePiloti = false;
    this.ricorsioneCostruttori = false;
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////FUNZIONI PER LE RICHIESTE API///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Permette di fare una chiamata API per avere dei dati di F1
   * @param ApiUrl URL della chiamata ergast.com
   * @param offset Offset per la chiamata
   * @returns Dati richiesti (https://ergast.com/mrd/)
   */
  getDataF1Api(ApiUrl: string, offset: number) {
    return this.http.get(ApiUrl + `?limit=${this.limit}&offset=${offset}`);
  }

  /**
   * Permette di fare una richiesta API a wikipedia.org per ottenere le immagini principali delle pagine richieste
   * @param titoliPagine Titoli delle pagine wiki
   * @param dimensioni Dimensioni delle immagini principali delle pagine wiki
   * @returns Dati richiesti (https://en.wikipedia.org/wiki/Special:ApiSandbox)
   */
  getDataWikipedia(titoliPagine: Array<string>, dimensioni: number) {
    return this.http.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${dimensioni}&titles=${titoliPagine.join('%7C')}`);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////FUNZIONI PER ESTRARRE I TITOLI DELLE PAGINE WIKI + FUNZIONE PER OTTENERE L'ID DELLA PAGINA DA UNA RICHIESTA WIKI////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Estrae gli URLs da un vettore contenente oggetti con proprietà url
   * @param vettoreGenerico Vettore di oggetti con proprietà url
   * @returns Urls estratti dagli oggetti del vettore
   */
  estraiUrlsDaVettoreGenerico(vettoreGenerico: { url: string; }[]): string[] {
    //Vettore contenente gli URLs estratti
    let vettoreUrls: string[] = new Array<string>();
    //Estrazione degli URLs
    vettoreGenerico.forEach((oggetto: { url: string; }) => {
      vettoreUrls.push(oggetto.url);
    });
    return vettoreUrls;
  }
  /**
   * Estrae i titoli delle pagine wiki dagli URLs
   * @param vettoreUrls Vettore contenente le URLs
   * @returns Titoli estratti dalle URLs
   */
  estraiTitoliDaUrls(vettoreUrls: string[]): string[] {
    //Vettore contenente i titoli estratti dagli URLs
    let titoliPagine: string[] = new Array<string>();
    //Estrazione dei titoli
    vettoreUrls.forEach(url => {
      titoliPagine.push(url.substring(decodeURI(url).lastIndexOf('/') + 1));
    });

    return titoliPagine;
  }
  /**
   * Estrae i titoli delle pagine wiki dagli URLs contenuti negli oggetti del vettore
   * @param vettoreGenerico Vettore di oggetti con proprietà url da cui estrarre i titoli
   * @returns Titoli estratti dagli oggetti del vettore
   */
  estraiTitoliDaVettoreGenerico(vettoreGenerico: { url: string; }[]): string[] {
    return this.estraiTitoliDaUrls(this.estraiUrlsDaVettoreGenerico(vettoreGenerico));
  }

  /**
   * Cerca l'ID della pagina wiki in base al titolo usato nella richiesta
   * @param titoloWiki Titolo usato nella richiesta API wiki
   * @param dataApiWiki Risposta della richiesta API wiki
   * @returns ID della pagina wiki
   */
  wikiFromTitleToId(titoloWiki: string, dataApiWiki: any): number {
    //Cerca se il titolo è stato normalizzato, e in caso lo aggiorna
    if (dataApiWiki.query.normalized !== undefined) {
      for (let i = 0; i < dataApiWiki.query.normalized.length; i++) {
        if (dataApiWiki.query.normalized[i].from === titoloWiki) {
          titoloWiki = dataApiWiki.query.normalized[i].to;
          break;
        }
      }
    }
    //Cerca se il titolo è stato reindirizzato, e in caso lo aggiorna
    if (dataApiWiki.query.redirects !== undefined) {
      for (let i = 0; i < dataApiWiki.query.redirects.length; i++) {
        if (dataApiWiki.query.redirects[i].from === titoloWiki) {
          titoloWiki = dataApiWiki.query.redirects[i].to;
          break;
        }
      }
    }
    //Cerca la pagina wiki con il titolo corrispondente a quello passato come parametro
    dataApiWiki.query.pageids.forEach((paginaId: any) => {
      if (dataApiWiki.query.pages[paginaId].title === titoloWiki) {
        //Restituisce l'id della pagina
        return paginaId;
      }
    });
    return -1;
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////STAGIONI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private ricorsioneStagioni: boolean;
  /**
   * Carica tutte le stagioni in cache
   * @returns Array contenente le stagioni presenti in cache
   */
  async getTutteStagioni(): Promise<Stagione[]> {
    if (!this.cacheF1.stagBool && !this.ricorsioneStagioni)
      await this.getTutteStagioniRicorsivo(0);

    //Restituisce le stagioni presenti in cache ordinate per anno
    return Array.from(this.cacheF1.stagioni.values()).sort((a, b) => b.anno - a.anno);

  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni in cache
   * @param offset Scostamento dalla prima stagione per la chiamata API
   */
  private async getTutteStagioniRicorsivo(offset: number) {
    this.ricorsioneStagioni = true;
    if (!this.cacheF1.stagBool) {
      //Richiesta API per ottenere le stagioni di F1 presenti dopo l'offset
      const stagioni: any = await lastValueFrom(this.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset));
      console.log(stagioni);

      //Inseriemento delle stagioni nella cache
      stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
        this.cacheF1.stagioni.set(parseInt(stagione.season), new Stagione(parseInt(stagione.season)));
      });

      //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
      if (this.cacheF1.stagioni.size < stagioni.MRData.total) {
        this.getTutteStagioniRicorsivo(offset + stagioni.MRData.SeasonTable.Seasons.length);
      }
      //Aggiorno il booleano che indica che le stagioni sono tutte state caricate in cache
      else if (this.cacheF1.stagioni.size == stagioni.MRData.total) {
        this.cacheF1.stagBool = true;
        this.ricorsioneStagioni = false;
      }

    }

    console.warn(this.cacheF1);
  }
  /**
   * Carica una singola stagione in cache
   * @param anno Anno della stagione da caricare 
   * @returns Stagione richiesta
   */
  async getStagione(anno: number): Promise<Stagione | undefined> {
    //Controllo se la stagione è già in cache
    if (this.cacheF1.stagioni.has(anno)) {
      return this.cacheF1.stagioni.get(anno);
    }

    //Richiesta API per la stagione (aspette che arrivi la risposta)
    const stagione: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${anno}/seasons.json`, 0));
    console.log(stagione);

    //Aggiunta della stagione alla cache
    this.cacheF1.stagioni.set(parseInt(stagione.MRData.SeasonTable.Seasons[0].season), new Stagione(parseInt(stagione.MRData.SeasonTable.Seasons[0].season)));

    return this.cacheF1.stagioni.get(anno);
  }



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////CIRCUITI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private ricorsioneCircuiti: boolean;
  /**
   * Carica tutti i circuiti in cache
   */
  getTuttiCircuiti(): Circuito[] {
    if (!this.cacheF1.circBool && !this.ricorsioneCircuiti)
      this.getTuttiCircuitiRicorsivo(0);

    return Array.from(this.cacheF1.circuiti.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i circuiti in cache
   * @param offset Scostamento dal primo circuito per la chiamata API
   */
  private getTuttiCircuitiRicorsivo(offset: number) {
    this.ricorsioneCircuiti = true;
    //Richiesta API per ottenere tutti i circuiti di F1
    this.getDataF1Api('https://ergast.com/api/f1/circuits.json', offset).subscribe((circuiti: any) => {
      console.log(circuiti);

      //Richiesta API wiki per ottenere le immagini dei circuiti
      this.getDataWikipedia(this.estraiTitoliDaVettoreGenerico(circuiti.MRData.CirtcuitTable.Circuits), this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei circuiti nella cache
        circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {

          //Link dell'immagine del circuito
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[this.wikiFromTitleToId(this.estraiTitoliDaUrls([circuito.url])[0], wikiData)]]?.thumbnail.source;
          if (immagine === undefined)
            immagine = this.placeholder;

          //Aggiunta del circuito alla cache
          this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
            circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

        });

        //Controllo se bisogna fare altre chiamate API
        if (this.cacheF1.circuiti.size < circuiti.MRData.total) {
          this.getTuttiCircuitiRicorsivo(offset + circuiti.MRData.CirtcuitTable.Circuits.length);
        } else if (this.cacheF1.circuiti.size == circuiti.MRData.total) {
          this.cacheF1.circBool = true;
          this.ricorsioneCircuiti = false;
        }
      });
    });

    console.warn(this.cacheF1);
  }
  /**
   * Carica un singolo circuito in cache
   * @param id ID del circuito da caricare
   */
  async getCircuito(id: string): Promise<Circuito | undefined> {

    //Controllo se il circuito è già in cache
    if (this.cacheF1.circuiti.has(id))
      return this.cacheF1.circuiti.get(id);

    //Richiesta API per il circuito
    const circuito: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/circuits/${id}.json`, 0));
    console.log(circuito);

    //Richiesta API wiki per ottenere l'immagine del circuito
    const wikiData: any = await lastValueFrom(this.getDataWikipedia(this.estraiTitoliDaUrls([circuito.MRData.CircuitTable.Circuits[0].url]), this.imageSize));
    console.log(wikiData);

    //Link dell'immagine del circuito
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    if (immagine === undefined)
      immagine = this.placeholder;

    //Aggiunta del circuito alla cache
    this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
      circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

    return this.cacheF1.circuiti.get(id);
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////PILOTI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private ricorsionePiloti: boolean;
  /**
   * Carica tutti i piloti in cache
   */
  async getTuttiPiloti(): Promise<Pilota[]> {
    if (!this.cacheF1.pilBool && !this.ricorsionePiloti)
      await this.getTuttiPilotiRicorsivo(0);

    return Array.from(this.cacheF1.piloti.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i piloti in cache
   * @param offset Scostamento dal primo pilota per la chiamata API
   */
  private async getTuttiPilotiRicorsivo(offset: number) {
    this.ricorsionePiloti = true;
    //Richiesta API per ottenere i piloti di F1
    const piloti: any = await lastValueFrom(this.getDataF1Api('https://ergast.com/api/f1/drivers.json', offset));
    console.log(piloti);

    //Richiesta API wiki per ottenere le immagini di tutti i circuiti
    const wikiData: any = await lastValueFrom(this.getDataWikipedia(this.estraiTitoliDaVettoreGenerico(piloti.MRData.DriverTable.Drivers), this.imageSize));
      console.log(wikiData);

      //Inserimento dei piloti nella cache
      piloti.MRData.DriverTable.Drivers.forEach((pilota: any) => {

        //Link dell'immagine del pilota
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[this.wikiFromTitleToId(this.estraiTitoliDaUrls([pilota.url])[0], wikiData)]]?.thumbnail.source;
        if (immagine === undefined)
          immagine = this.placeholder;

        //Aggiunta del pilota alla cache
        this.cacheF1.piloti.set(pilota.driverId,
          new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));


      //Controllo se bisogna fare altre richieste API
      if (this.cacheF1.piloti.size < piloti.MRData.total) {
        this.getTuttiPilotiRicorsivo(offset + piloti.MRData.DriverTable.Drivers.length);
      } else if (this.cacheF1.piloti.size == piloti.MRData.total) {
        this.cacheF1.pilBool = true;
        this.ricorsionePiloti = false;
      }
    });

    console.warn(this.cacheF1);
  }
  /**
   * Carica un singolo pilota in cache
   * @param id ID del pilota da caricare
   */
  async getPilota(id: string): Promise<Pilota | undefined> {

    //Controllo se è già in cache
    if (this.cacheF1.piloti.has(id))
      return this.cacheF1.piloti.get(id);


    //Richiesta API per il pilota
    const pilota: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/driver/${id}.json`, 0));
    console.log(pilota);

    //Richiesta API per ottenere l'immagine del pilota
    const wikiData: any = await lastValueFrom(this.getDataWikipedia(this.estraiTitoliDaUrls([pilota.MRData.DriverTable.Drivers[0].url]), this.imageSize))
    console.log(wikiData);

    //Link dell'immagine del pilota
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    if (immagine === undefined)
      immagine = this.placeholder;

    //Aggiunta del pilota alla cache
    this.cacheF1.piloti.set(pilota.driverId,
      new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth),
        pilota.nationality, pilota.permanentNumber, pilota.code));

    return this.cacheF1.piloti.get(id);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////COSTRUTTORI////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private ricorsioneCostruttori: boolean;
  /**
   * Carica tutti i costruttori in cache
   */
  getTuttiCostruttori(): Costruttore[] {
    if (!this.cacheF1.costBool && !this.ricorsioneCostruttori)
      this.getTuttiCostruttoriRicorsivo(0);

    return Array.from(this.cacheF1.costruttori.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i costruttori in cache
   * @param offset Scostamento dal primo costruttore per la chiamata API
   */
  private getTuttiCostruttoriRicorsivo(offset: number) {
    this.ricorsioneCostruttori = true;
    //Richiesta API per ottenere i costruttori di F1
    this.getDataF1Api('https://ergast.com/api/f1/constructors.json', offset).subscribe((costruttori: any) => {
      console.log(costruttori);

      //Richiesta API wiki per ottenere le immagini di tutti i circuiti
      this.getDataWikipedia(this.estraiTitoliDaVettoreGenerico(costruttori.MRData.ConstructorTable.Constructors), this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei costruttori nella cache
        costruttori.MRData.ConstructorTable.Constructors.forEach((costruttore: any) => {

          //Link dell'immagine del costruttore
          let immagine: string | undefined;
          immagine = wikiData.query.pages[wikiData.query.pageids[this.wikiFromTitleToId(this.estraiTitoliDaUrls([costruttore.url])[0], wikiData)]]?.thumbnail.source;
          if (immagine === undefined)
            immagine = this.placeholder;

          //Aggiunta del costruttore alla cache
          this.cacheF1.costruttori.set(costruttore.constructorId,
            new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
        });

        //Controllo se bisogna fare altre richieste API
        if (this.cacheF1.costruttori.size < costruttori.MRData.total) {
          this.getTuttiCostruttoriRicorsivo(offset + costruttori.MRData.ConstructorTable.Constructors.length);
        } else if (this.cacheF1.costruttori.size == costruttori.MRData.total) {
          this.cacheF1.costBool = true;
          this.ricorsioneCostruttori = false;
        }
      });
    });

    console.warn(this.cacheF1);
  }
  /**
   * Carica un singolo costruttore in cache
   * @param id ID del costruttore da caricare
   */
  async getCostruttore(id: string): Promise<Costruttore | undefined> {
    //Controllo se il costruttore è già in cache
    if (this.cacheF1.costruttori.has(id))
      return this.cacheF1.costruttori.get(id);

    //Richiesta API per il costruttore
    const costruttore: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/constructors/${id}.json`, 0))
    console.log(costruttore);

    //Richiesta API per ottenere l'immagine del costruttore
    const wikiData: any = await lastValueFrom(this.getDataWikipedia(this.estraiTitoliDaUrls([costruttore.MRData.ConstructorTable.Constructors[0].url]), this.imageSize))
    console.log(wikiData);

    //Link dell'immagine del costruttore
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    if (immagine === undefined)
      immagine = this.placeholder;

    //Aggiunta del costruttore alla cache
    this.cacheF1.costruttori.set(costruttore.constructorId,
      new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));

    return this.cacheF1.costruttori.get(id);
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////GARE////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getTutteGareStagione(anno: number): Promise<Gara[]> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le gare
    if (!stagione.gareBool) {
      await this.getTutteGareStagioneRicorsivo(stagione, 0);
    }

    //Restituisco le gare sotto forma di Array ordinato crescentemente per round
    return Array.from(stagione.gare.values()).sort((a: Gara, b: Gara) => a.round - b.round);
  }
  private async getTutteGareStagioneRicorsivo(stagione: Stagione, offset: number) {
    //Richiesta API per ottenere le gare della stagione
    const gare: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}.json`, offset))
    console.log(gare);

    //Inserimento delle gare nella cache
    gare.MRData.RaceTable.Races.forEach(async (gara: any) => {
      const circuito: Circuito | undefined = await this.getCircuito(gara.Circuit.circuitId);
      if (circuito === undefined)
        throw new Error("Errore nel caricamento del circuito nella gara");
      stagione.gare.set(parseInt(gara.round), new Gara(gara.raceName,
        parseInt(gara.round), new Date(gara.date + " " + gara.time), circuito, stagione));
    });

    //Controllo se bisogna fare altre richieste API
    if (stagione.gare.size < gare.MRData.total) {
      this.getTutteGareStagioneRicorsivo(stagione, offset + gare.MRData.RaceTable.Races.length)
    } else if (stagione.gare.size == gare.MRData.total) {
      stagione.gareBool = true;
    }

    console.warn(stagione);
  }
  async getGaraStagione(anno: number, round: number): Promise<Gara | undefined> {
    //Prendo la stagione
    const stagione: Stagione | undefined = await this.getStagione(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Richiesta API per ottenere la gara
    const gara: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${stagione.anno}/${round}.json`, 0))
    console.log(gara);

    //Prendo il circuito
    const circuito: Circuito | undefined = await this.getCircuito(gara.MRData.RaceTable.Races[0].Circuit.circuitId)
    if (circuito === undefined)
      throw new Error("Errore nel caricamente del circuito nella gara");

    stagione.gare.set(parseInt(gara.round), new Gara(gara.raceName,
      parseInt(gara.round), new Date(gara.date + " " + gara.time), circuito, stagione));

    return stagione.gare.get(round);
  }
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
  private async loadClassificaPilotiStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaPilotiBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaPiloti: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${stagione}/driverStandings.json`, offset));
      console.log(classificaPiloti);

      //Inserisco le posizioni nella cache
      classificaPiloti.MRData.StandingsTable.StandingsLists[0].DriverStandings.forEach(async (posizione: any) => {
        const pilota: Pilota | undefined = await this.getPilota(posizione.Driver.driverId);
        if (pilota === undefined)
          throw new Error("Errore nel caricamento della pilota nella classifica");
        const costruttore: Costruttore | undefined = await this.getCostruttore(posizione.Constructors[0].constructorId);
        if (costruttore === undefined)
          throw new Error("Errore nel caricamento del costruttore nella classifica");

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
  async getClassificaCostruttoriStagione(anno: number): Promise<PostoClassificaCostruttori[]> {
    //Prendo la stagione
    const stagione: Stagione | undefined = this.cacheF1.stagioni.get(anno);
    if (stagione === undefined)
      throw new Error('Errore nel caricamento della stagione');

    //Prendo le classifiche
    if (!stagione.classificaCostruttoriBool) {
      await this.getClassificaCostruttoriStagioneRicorsivo(stagione, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(stagione.classificaCostruttori.values()).sort((
      a: PostoClassificaCostruttori, b: PostoClassificaCostruttori) => b.punti - a.punti);
  }
  private async getClassificaCostruttoriStagioneRicorsivo(stagione: Stagione, offset: number) {
    if (!stagione.classificaCostruttoriBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaCostruttori: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${stagione}/constructorStandings.json`, offset));
      console.log(classificaCostruttori);

      //Inserisco le posizioni nella cache
      classificaCostruttori.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.forEach(async (posizione: any) => {
        const costruttore: Costruttore | undefined = await this.getCostruttore(posizione.Constructor.constructorId);
        if (costruttore === undefined)
          throw new Error("Errore nel caricamento del costruttore nella classifica");

        stagione.classificaCostruttori.set(parseInt(posizione.position),
          new PostoClassificaCostruttori(stagione, parseInt(posizione.position), parseInt(posizione.points),
            parseInt(posizione.wins), costruttore));
      });

      //Controllo se bisogna fare altre richieste API
      if (stagione.classificaCostruttori.size < classificaCostruttori.MRData.total) {
        this.getClassificaCostruttoriStagioneRicorsivo(stagione, offset + classificaCostruttori.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.length)
      } else if (stagione.classificaCostruttori.size == classificaCostruttori.MRData.total) {
        stagione.classificaCostruttoriBool = true;
      }
    }
  }
  async getClassificaGara(anno: number, round: number): Promise<PostoGara[]> {
    //Prendo la stagione
    const gara: Gara | undefined = await this.getGaraStagione(anno, round);
    if (gara === undefined)
      throw new Error('Errore nel caricamento della gara');

    //Prendo le classifiche
    if (!gara.classificaGaraBool) {
      await this.getClassificaGaraRicorsivo(gara, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(gara.classificaGara.values()).sort((a: PostoGara, b: PostoGara) => b.punti - a.punti);
  }
  private async getClassificaGaraRicorsivo(gara: Gara, offset: number) {
    if (!gara.classificaGaraBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaGara: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${gara.stagione.anno}/${gara.round}/results.json`, offset));
      console.log(classificaGara);

      //Inserisco le posizioni nella cache
      classificaGara.MRData.RaceTable.Races[0].Results.forEach(async (posizione: any) => {
        //prendo il pilota
        const pilota: Pilota | undefined = await this.getPilota(posizione.Driver.driverId);
        if (pilota === undefined)
          throw new Error("Errore nel caricamento della pilota nella classifica");
        const costruttore: Costruttore | undefined = await this.getCostruttore(posizione.Constructor.constructorId);
        if (costruttore === undefined)
          throw new Error("Errore nel caricamento del costruttore nella classifica");

        gara.classificaGara.set(parseInt(posizione.position),
          new PostoGara(parseInt(posizione.position), pilota, costruttore, parseInt(posizione.laps),
            parseInt(posizione.grid), parseInt(posizione.points), (posizione.status === "Finished"),
            gara, new Tempo(posizione.Time.millis)));
      });

      //Controllo se bisogna fare altre richieste API
      if (gara.classificaGara.size < classificaGara.MRData.total) {
        this.getClassificaGaraRicorsivo(gara, offset + classificaGara.MRData.RaceTable.Races[0].Results.length);
      } else if (gara.classificaGara.size == classificaGara.MRData.total) {
        gara.classificaGaraBool = true;
      }

    }
  }

  //Aggiutna dei costruttori a un pilota
  async getCostruttoriPilota(id: string): Promise<Costruttore[]> {
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento dei costruttori del pilota");

    //Prendo i costruttori
    if (!pilota.costruttoriBool)
      await this.getCostruttoriPilotaRicorsivo(pilota, 0);

    return pilota.costruttori;
  }
  private async getCostruttoriPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.costruttoriBool) {
      //Richiesta API per ottenere i costruttori
      const costruttori: any = await this.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/constructors.json`, offset);
      console.log(costruttori);

      //Inserisco i costruttori nella cache
      costruttori.MRData.ConstructorTable.Constructors.forEach(async (costruttoreFromData: any) => {
        const costruttore: Costruttore | undefined = await this.getCostruttore(costruttoreFromData.constructorId);
        if (costruttore === undefined)
          throw new Error("Errore nel caricamento del costruttore nel pilota");

        pilota.costruttori.push(costruttore);
      });

      //Controllo se bisogna fare altre richieste API
      if (pilota.costruttori.length < costruttori.MRData.total) {
        this.getCostruttoriPilotaRicorsivo(pilota, offset + costruttori.MRData.onstructorTable.Constructors.length);
      } else if (pilota.costruttori.length == costruttori.MRData.total) {
        pilota.costruttoriBool = true;
      }
    }
  }


  //Aggiunta stagioni pilota
  async getStagioniERisultatoPilota(id: string) {
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Prendo le stagioni e posizioni
    if (!pilota.stagioniBool)
      await this.getStagioniERisultatoPilotaRicorsivo(pilota, 0);

    return Array.from(pilota.stagioniERisultato.values()).sort((
      a: PostoClassificaPiloti, b: PostoClassificaPiloti) => b.stagione.anno - a.stagione.anno);
  }
  private async getStagioniERisultatoPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.stagioniBool) {
      const stagioniEPosizione: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/driverStandings.json`, offset));
      console.log(stagioniEPosizione);

      //Inserisco le stagioni e risultati nella cache
      stagioniEPosizione.MRData.StandingsTable.StandingsLists.forEach(async (posizione: any) => {
        const stagione: Stagione | undefined = await this.getStagione(posizione.season);
        if (stagione === undefined)
          throw new Error("Errore nel caricamento della stagione nel pilota");

        await this.getClassificaPilotiStagione(posizione.season);

        const postoStagione: PostoClassificaPiloti | undefined = stagione.classificaPiloti.get(posizione.DriverStandings.position);
        if (postoStagione === undefined)
          throw new Error("Errore nel caricamento della posizione nel pilota");

        pilota.stagioniERisultato.set(stagione.anno, postoStagione);
      });

      //Controllo se bisogna fare altre richieste API
      if (pilota.stagioniERisultato.size < stagioniEPosizione.MRData.total) {
        this.getStagioniERisultatoPilotaRicorsivo(pilota, offset + stagioniEPosizione.MRData.StandingsTable.StandingsLists.length);
      } else if (pilota.stagioniERisultato.size == stagioniEPosizione.MRData.total) {
        pilota.stagioniBool = true;
      }
    }
  }


  async getPilotiCostruttore(id: string) {
    const costruttore: Costruttore | undefined = await this.getCostruttore(id);
    if (costruttore === undefined)
      throw new Error("Errore nel caricamento del costruttore");

    //Prendo i piloti
    if (!costruttore.pilotiBool)
      await this.getPilotiCostruttoreRicorsivo(costruttore, 0);

    return costruttore.piloti;
  }
  private async getPilotiCostruttoreRicorsivo(costruttore: Costruttore, offset: number) {
    if (!costruttore.pilotiBool) {
      const piloti: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/constructors/${costruttore.id}/drivers.json`, offset));
      console.log(piloti);

      //Inserisco i piloti nella cache
      piloti.MRData.DriverTable.Drivers.forEach(async (pilotaData: any) => {
        const pilota: Pilota | undefined = await this.getPilota(pilotaData.driverId);
        if (pilota === undefined)
          throw new Error("Errore nel caricamento del pilota nel costruttore")

        costruttore.piloti.push(pilota);
      });

      //Controllo se devo fare altre richieste
      if (costruttore.piloti.length < piloti.MRData.total) {
        this.getPilotiCostruttoreRicorsivo(costruttore, offset + piloti.MRData.DriverTable.Drivers.length);
      } else if (costruttore.piloti.length == piloti.MRData.total) {
        costruttore.pilotiBool = true;
      }
    }
  }


  //Aggiunta stagioni costruttore
  async getStagioniERisultatoCostruttore(id: string) {
    const costruttore: Costruttore | undefined = await this.getCostruttore(id);
    if (costruttore === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Prendo le stagioni e posizioni
    if (!costruttore.stagioniBool)
      await this.getStagioniERisultatoCostruttoreicorsivo(costruttore, 0);

    return Array.from(costruttore.stagioniEGare.values()).sort((
      a: PostoClassificaCostruttori, b: PostoClassificaCostruttori) => b.stagione.anno - a.stagione.anno);
  }
  private async getStagioniERisultatoCostruttoreicorsivo(costruttore: Costruttore, offset: number) {
    if (!costruttore.stagioniBool) {
      const stagioniEPosizione: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/constructors/${costruttore.id}/constructorStandings.json`, offset));
      console.log(stagioniEPosizione);

      //Inserisco le stagioni e risultati nella cache
      stagioniEPosizione.MRData.StandingsTable.StandingsLists.forEach(async (posizione: any) => {
        const stagione: Stagione | undefined = await this.getStagione(posizione.season);
        if (stagione === undefined)
          throw new Error("Errore nel caricamento della stagione nel costruttore");

        await this.getClassificaCostruttoriStagione(posizione.season);

        const postoStagione: PostoClassificaCostruttori | undefined = stagione.classificaCostruttori.get(posizione.ConstructorStandings.position);
        if (postoStagione === undefined)
          throw new Error("Errore nel caricamento della posizione nel costruttore");

        costruttore.stagioniEGare.set(stagione.anno, postoStagione);
      });

      //Controllo se bisogna fare altre richieste API
      if (costruttore.stagioniEGare.size < stagioniEPosizione.MRData.total) {
        this.getStagioniERisultatoCostruttoreicorsivo(costruttore, offset + stagioniEPosizione.MRData.StandingsTable.StandingsLists.length);
      } else if (costruttore.stagioniEGare.size == stagioniEPosizione.MRData.total) {
        costruttore.stagioniBool = true;
      }
    }
  }


  //Carica gare
  async getGareCircuito(id: string) {
    const circuito: Circuito | undefined = await this.getCircuito(id);
    if (circuito === undefined)
      throw new Error("Errore nel caricamento del circuito");

    //Prendo le gare
    if (!circuito.stagioniBool)
      await this.getGareCircuitoRicorsivo(circuito, 0);

    return Array.from(circuito.vettoreStagioniGare.values()).sort((
      a: Gara, b: Gara) => b.stagione.anno - a.stagione.anno);;
  }
  private async getGareCircuitoRicorsivo(circuito: Circuito, offset: number) {
    if (!circuito.stagioniBool) {
      const gareCircuito: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/circuits/${circuito.id}/results/1.json`, offset));
      console.log(gareCircuito);

      //Inserisco le gare nella cache
      gareCircuito.MRData.RaceTable.Races.forEach(async (garaData: any) => {
        const gara: Gara | undefined = await this.getGaraStagione(garaData.season, garaData.round);
        if (gara === undefined)
          throw new Error("Errore nel caricare la gara nel circuito");

        circuito.vettoreStagioniGare.set(gara.stagione.anno, gara);
      });

      //Controllo se devo fare altre richieste
      if (circuito.vettoreStagioniGare.size < gareCircuito.MRData.total) {
        this.getGareCircuitoRicorsivo(circuito, offset + gareCircuito.MRData.RaceTable.Races.length);
      } else if (circuito.vettoreStagioniGare.size == gareCircuito.MRData.total) {
        circuito.stagioniBool = true;
      }
    }
  }

  /*
  async getClassificaGiri(anno: number, round: number, giro: number): Promise<PostoGiro[]> {
    //Prendo la gara
    const gara: Gara | undefined = await this.getGaraStagione(anno, round);
    if (gara === undefined)
      throw new Error('Errore nel caricamento della gara');

    //Prendo le classifiche
    if (!gara.classificaGiriBool) {
      await this.getClassificaGiriRicorsivo(gara, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(gara.classificaGiri.values()).sort((a: PostoGiri, b: PostoGiri) => b.punti - a.punti);
  }
  */

  /*
  async getClassificaQualifica(anno: number, round: number): Promise<PostoQualifica[]> {
    //Prendo la stagione
    const gara: Gara | undefined = await this.getGaraStagione(anno, round);
    if (gara === undefined)
      throw new Error('Errore nel caricamento della gara');

    //Prendo le classifiche
    if (!gara.classificaQualificaBool) {
      await this.getClassificaQualificaRicorsivo(gara, 0);
    }

    //Restituisco le classifiche sotto forma di Array ordinato decrescentemente per punti
    return Array.from(gara.classificaQualifica.values()).sort((a: PostoQualifica, b: PostoQualifica) => b.punti - a.punti);
  }

  async getClassificaQualificaRicorsivo(gara: Gara, offset: number) {
    if (!gara.classificaQualificaBool) {
      //Faccio la richiesta API per ottenere la classifica
      const classificaQualifica: any = await lastValueFrom(this.getDataF1Api(`https://ergast.com/api/f1/${gara.stagione.anno}/${gara.round}/qualifying.json`, offset));
      console.log(classificaQualifica);

      //Inserisco le posizioni nella cache
      classificaQualifica.MRData.RaceTable.Races[0].QualifyingResults.forEach((posizione: any) => {

      });
    }
  }*/


}

export class CacheF1 {
  stagBool: boolean = false;
  pilBool: boolean = false;
  costBool: boolean = false;
  circBool: boolean = false;

  stagioni: Map<number, Stagione>;
  piloti: Map<string, Pilota>;
  costruttori: Map<string, Costruttore>;
  circuiti: Map<string, Circuito>;

  constructor() {
    this.stagioni = new Map<number, Stagione>();
    this.piloti = new Map<string, Pilota>();
    this.costruttori = new Map<string, Costruttore>();
    this.circuiti = new Map<string, Circuito>();
  }

  getStagione(anno: number): Stagione | undefined {
    return this.stagioni.get(anno);
  }
}