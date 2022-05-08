import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

  constructor(private http: HttpClient) {
    /*
    MAX --> 50 per ottimizzre le richieste wikipedia
    */
    this.limit = 50;
    this.placeholder = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    this.imageSize =800;
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
      const decodedUrl: string = decodeURI(url)
      titoliPagine.push(url.substring(decodedUrl.lastIndexOf('/') + 1));
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
    if (dataApiWiki.query.normalized) {
      for (let i = 0; i < dataApiWiki.query.normalized.length; i++) {
        if (dataApiWiki.query.normalized[i].from === titoloWiki) {
          titoloWiki = dataApiWiki.query.normalized[i].to;
          break;
        }
      }
    }
    //Cerca se il titolo è stato reindirizzato, e in caso lo aggiorna
    if (dataApiWiki.query.redirects) {
      for (let i = 0; i < dataApiWiki.query.redirects.length; i++) {
        if (dataApiWiki.query.redirects[i].from === titoloWiki) {
          titoloWiki = dataApiWiki.query.redirects[i].to;
          break;
        }
      }
    }
    //Cerca la pagina wiki con il titolo corrispondente a quello passato come parametro
    for (let i = 0; i < dataApiWiki.query.pageids.length; i++) {
      const paginaId: number = dataApiWiki.query.pageids[i];
      if (dataApiWiki.query.pages[paginaId].title === titoloWiki) {
        return paginaId;
      }
    }
    return -1;
  }

}