import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Classe che permette di fare chiamate HTTP a wikipedia e alla API di F1
 */
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
    this.imageSize = 800;
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
    //https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/
    return this.http.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&redirects=1&imlimit=500&prop=pageimages|images&piprop=thumbnail&pithumbsize=${dimensioni}&pilicense=any&titles=${(titoliPagine.join('|'))}`);
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
    vettoreUrls.forEach((url: string) => {
      const decodedUrl: string = decodeURI(url)
      titoliPagine.push(decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1));
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


  getImageUrlFromPage(page: any, forceThumbnail: boolean, searchInImages?: string[], bannedImages?: string[]): string {

    //mette i parametri di ricerca in lowercase e elimina i duplicati
    if (searchInImages) {
      searchInImages = searchInImages.map(elem => elem.toLowerCase());
      searchInImages = searchInImages.filter((value, index, self) => self.indexOf(value) === index);
    }
    //Controlla se c'è l'immagine "ufficiale" della pagina
    if (page?.thumbnail?.source) {
      if (searchInImages && !forceThumbnail) {
        for (let i = 0; i < searchInImages.length; i++) {
          const titoloThumbnail: string = page.thumbnail.source;
          if(bannedImages && bannedImages.includes(titoloThumbnail))
            continue;
          if ((titoloThumbnail.toLowerCase()).includes(searchInImages[i].toLowerCase())) {
            return page.thumbnail.source;
          }
        }
      }
      else
        return page.thumbnail.source;
    }

    //Cicla tra le imamgini della pagina e usa il filtro di ricerca
    if (page?.images && searchInImages) {
      const indiceRisultato: number = this.risultatoPiuProbabile(page, searchInImages, bannedImages);
      if (indiceRisultato !== -1) {
        return "https://en.wikipedia.org/wiki/Special:Redirect?wptype=file&wpvalue=" + page.images[indiceRisultato].title + "&width=" + this.imageSize;
      }
    }

    return this.placeholder;
  }

  /**
   * Confrontando tutti i filtri passati, restituisce l'indice del risultato più probabile
   * @param page Pagina wiki
   * @param filtri Parole da ricercare nell'immagine
   * @returns Indice dell'immagine più probabile
   */
  private risultatoPiuProbabile(page: any, filtri: string[], bannedImages?: string[]): number {
    if (!page.images)
      return -1;

    let maxOc = 0; //Numero massime di occorrenze
    let maxIndex = -1; //Indice dell'immagine con il numero massimo di occorrenze
    //Cicla tra le imamgini della pagina
    for (let i = 0; i < page.images.length; i++) {
      const titolo: string = page.images[i].title;

      //Controlla se l'imamgine appartiene tra quelle bannate
      if (bannedImages && bannedImages.includes(titolo))
        continue;

      let oc = 0; //numero di occorrenze
      //Ciclo per contare le occorrenze con i filtri
      for (let j = 0; j < filtri.length; j++) {
        if (titolo.toLowerCase().includes(filtri[j].toLowerCase())) {
          oc += (filtri.length-j)*filtri.length;
        }
      }
      //Controllo se bisogna cambiare i massimi
      if (oc > maxOc) {
        maxOc = oc;
        maxIndex = i;
      }
    
    }
    return maxIndex;
  }

  getImageUrlCircuito(page: any, circuito: { circuitId: string; circuitName: string; Location: { locality: string; country: string; }; }): string {
    let searchInImages: string[] = (circuito.Location.locality + "&" + (circuito.circuitId).replace(/_/g, "&") + "&" + (circuito.circuitName + "&" + "&" + circuito.Location.country).replace(/ /g, "&")).split("&");
    return this.getImageUrlFromPage(page, false, searchInImages, ["File:Cscr-featured.svg", "File:Commons-logo.svg", `https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Formula_1_all_over_the_world-2022.svg/${this.imageSize}px-Formula_1_all_over_the_world-2022.svg.png`]);
  }

  getImageUrlCostruttore(page: any, costruttore: { constructorId: string; }): string {
    return this.getImageUrlFromPage(page, true, [costruttore.constructorId, "logo"], ["File:Commons-logo.svg"]);
  }

  getImageUrlPilota(page: any, pilota: { familyName: string; }): string {
    return this.getImageUrlFromPage(page, true, [pilota.familyName], ["File:Commons-logo.svg"]);
  }
}