import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { Stagione } from '../classi/stagione';
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
  cacheF1: CacheF1;

  constructor(private http: HttpClient) {
    /*
    MAX --> 50 per ottimizzre le richieste wikipedia
    */
    this.limit = 50;
    this.placeholder = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    this.imageSize = 500;
    this.cacheF1 = new CacheF1();
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
  /**
   * Carica tutte le stagioni in cache
   * @returns Array contenente le stagioni presenti in cache
   */
   getTutteStagioni() {
    if (!this.cacheF1.stagBool)
      this.getTutteStagioniRicorsivo(0);

    //Controllo se il booleano in cache è vero
    //if (this.cacheF1.stagBool) {
      //return a sorted array derived by the values of the cache. It is sorted by the key in decrising order
      console.warn("return :)))");
      //return Array.from(this.cacheF1.stagioni.values()).sort((a, b) => b.anno - a.anno);
    //}

    //return undefined;
  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni in cache
   * @param offset Scostamento dalla prima stagione per la chiamata API
   */
  private getTutteStagioniRicorsivo(offset: number) {
    //Richiesta API per ottenere le stagioni di F1 presenti dopo l'offset
    this.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset).subscribe((stagioni: any) => {
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
      // else if(this.cacheF1.stagioni.size == stagioni.MRData.total) {
      //   this.cacheF1.stagBool = true;
      // }
    });

    console.warn(this.cacheF1);
  }
  /**
   * Carica una singola stagione in cache
   * @param anno Anno della stagione da caricare 
   * @returns Stagione richiesta
   */
  getStagione(anno: number) {
    //Controllo se la stagione è già in cache
    // console.log(this.cacheF1.stagioni.has(anno));
    // if (this.cacheF1.stagioni.has(anno)) {
    //   return this.cacheF1.stagioni.get(anno);
    // }
    //Richiesta API per la stagione
    this.getDataF1Api(`https://ergast.com/api/f1/${anno}/seasons.json`, 0).subscribe((stagione: any) => {
      console.log(stagione);
      //Aggiunta della stagione alla cache
      this.cacheF1.stagioni.set(stagione.MRData.SeasonTable.Seasons[0].season, new Stagione(stagione.MRData.SeasonTable.Seasons[0].season));

      //return this.getStagione(anno);
      //return this.cacheF1.stagioni.get(anno);
      this.cacheF1.stagioni.get(anno);
    });

    //return undefined;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////CIRCUITI//////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Carica tutti i circuiti in cache
   */
   getTuttiCircuiti(): Array<Circuito> {

    if(!this.cacheF1.circBool)
      this.getTuttiCircuitiRicorsivo(0);
    //Controllo se il booleano in cache è vero


    return Array.from(this.cacheF1.circuiti.values());

  }
  /**
   * Metodo ricorsivo per caricare tutti i circuiti in cache
   * @param offset Scostamento dal primo circuito per la chiamata API
   */
  private getTuttiCircuitiRicorsivo(offset: number) {
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
        } else if(this.cacheF1.circuiti.size == circuiti.MRData.total) {
          this.cacheF1.circBool = true;
        }
      });
    });

    console.warn(this.cacheF1);
  }
  /**
   * Carica un singolo circuito in cache
   * @param id ID del circuito da caricare
   */
  getCircuito(id: string): Circuito | undefined {

    //Controllo se il circuito è già in cache
    if (this.cacheF1.circuiti.has(id))
      return this.cacheF1.circuiti.get(id);

    //Richiesta API per il circuito
    this.getDataF1Api(`https://ergast.com/api/f1/circuits/${id}.json`, 0).subscribe((circuito: any) => {
      console.log(circuito);

      //Richiesta API wiki per ottenere l'immagine del circuito
      this.getDataWikipedia(this.estraiTitoliDaUrls([circuito.MRData.CircuitTable.Circuits[0].url]), this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Link dell'immagine del circuito
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        if (immagine === undefined)
          immagine = this.placeholder;

        //Aggiunta del circuito alla cache
        this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
          circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
        
        return this.getCircuito(id);
      });
    });

    return undefined;
  }

  gett(anno:number): Stagione | undefined {
    return this.cacheF1.getStagione(anno);
  }
  

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