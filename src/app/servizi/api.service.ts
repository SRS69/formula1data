import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { Stagione } from '../classi/stagione';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //limite di dati per ogni richiesta F1
  private limit: number;
  private placeholder: string;
  private imageSize: number;
  cacheF1: CacheF1;

  constructor(private http: HttpClient) {
    this.limit = 50;
    this.placeholder = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    this.imageSize = 500;
    this.cacheF1 = new CacheF1();
  }

  getDataF1Api(ApiUrl: string, offset: number) {
    return this.http.get(ApiUrl + `?limit=${this.limit}&offset=${offset}`);
  }

  getDataWikipedia(titoliPagine: Array<string>, dimensioni: number) {
    return this.http.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${dimensioni}&titles=${titoliPagine.join('%7C')}`);
  }

  private checkWikiURL(wikipediaURL: string) {
    if (wikipediaURL.indexOf('wiki') != -1)
      return wikipediaURL;

    throw new Error('URL di wiki non valido');
  }

  getTutteStagioni() {
    this.getTutteStagioniRicorsivo(0);
  }
  getStagione(anno: number) {
    //``
    this.getDataF1Api(`https://ergast.com/api/f1/${anno}/seasons.json`, 0).subscribe((stagione: any) => {
      console.log(stagione);
      this.cacheF1.stagioni.set(stagione.MRData.SeasonTable.Seasons[0].season, new Stagione(stagione.MRData.SeasonTable.Seasons[0].season));
    });
  }
  private getTutteStagioniRicorsivo(offset: number) {
    //Richiesta API per ottenere le stagioni di F1
    this.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset).subscribe((stagioni: any) => {
      console.log(stagioni);

      //Inseriemento delle stagioni nella cache
      stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
        this.cacheF1.stagioni.set(stagione.season, new Stagione(stagione.season));
      });

      //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
      if (this.cacheF1.stagioni.size < stagioni.MRData.total) {
        this.getTutteStagioniRicorsivo(offset + stagioni.MRData.SeasonTable.Seasons.length);
        //this.getTutteStagioniRicorsivo(this.cacheF1.stagioni.size);
      }
    });

    console.warn(this.cacheF1);

  }

  getTuttiCircuiti() {
    this.getTuttiCircuitiRicorsivo(0);
  }
  getCircuito(id: string) {
    this.getDataF1Api(`https://ergast.com/api/f1/${id}/circuit.json`, 0).subscribe((circuito: any) => {
      console.log(circuito);

      //Richiesta API wiki per ottenere l'immagine del circuito
      this.getDataWikipedia([circuito.MRData.CircuitTable.Circuits[0].circuitName], this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        let immagine: string;
        if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        else
          immagine = this.placeholder;

        this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
          circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
      });
    });
  }

  private wikiFromTitleToIdResolution(wikiTitle: string, wikiData: any): number {
    if(wikiData.query.normalized !== undefined) {
      for (let i = 0; i < wikiData.query.normalized.length; i++) {
        if (wikiData.query.normalized[i].from === wikiTitle) {
          wikiTitle = wikiData.query.normalized[i].to;
          break;
        }
      }
    }
    if(wikiData.query.redirects !== undefined) {
      for (let i = 0; i < wikiData.query.redirects.length; i++) {
        if (wikiData.query.redirects[i].from === wikiTitle) {
          wikiTitle = wikiData.query.redirects[i].to;
          break;
        }
      }
    }
    wikiData.query.pageids.forEach((paginaId: any) => {
      if (wikiData.query.pages[paginaId].title === wikiTitle) {
        return paginaId;
      }
    });
    return -1;
  }
  private getTuttiCircuitiRicorsivo(offset: number) {
  //Richiesta API per ottenere i circuiti di F1
  this.getDataF1Api('https://ergast.com/api/f1/circuits.json', offset).subscribe((circuiti: any) => {
    console.log(circuiti);

    //Richiesta API wiki per ottenere le immagini di tutti i circuiti
    let allTitle = new Array<string>();
    circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {
      allTitle.push(circuito.circuitName);
    });
    this.getDataWikipedia(allTitle, this.imageSize).subscribe((wikiData: any) => {
      console.log(wikiData);

      circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {
        let immagine: string | undefined;
        immagine = wikiData.query.pages[wikiData.query.pageids[this.wikiFromTitleToIdResolution(circuito.circuitName, wikiData)]]?.thumbnail.source;
        if(immagine === undefined)
          immagine = this.placeholder;

        this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
          circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));

      });

      // for (let i = 0; i < circuiti.MRData.CirtcuitTable.Circuits.length; i++) {
      //   let immagine: string;
      //   if (wikiData.query.pages[wikiData.query.pageids[i]].thumbnail.source !== undefined)
      //     immagine = wikiData.query.pages[wikiData.query.pageids[i]].thumbnail.source;
      //   else
      //     immagine = this.placeholder;

      //   this.cacheF1.circuiti.set(circuiti.MRData.CirtcuitTable.Circuits[i].circuitId, new Circuito(circuiti.MRData.CirtcuitTable.Circuits[i].circuitId,
      //     circuiti.MRData.CirtcuitTable.Circuits[i].circuitName, immagine, circuiti.MRData.CirtcuitTable.Circuits[i].Location.lat,
      //     circuiti.MRData.CirtcuitTable.Circuits[i].Location.long, circuiti.MRData.CirtcuitTable.Circuits[i].Location.locality,
      //     circuiti.MRData.CirtcuitTable.Circuits[i].Location.country));
      // }

      // wikiData.query.pageids.forEach(pagina => {
      //   let immagine: string;

      //   if (wikiData.query.pages[pagina].thumbnail.source !== undefined)
      //     immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
      //   else
      //     immagine = this.placeholder;

      //   this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
      //     circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
      // });
    });


    // circuiti.MRData.CirtcuitTable.Circuits.forEach((circuito: any) => {
    //   this.getDataWikipedia([circuito.url], this.imageSize).subscribe((wikiData: any) => {
    //     console.log(wikiData);

    //     let immagine: string;
    //     if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
    //       immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    //     else
    //       immagine = this.placeholder;

    //     this.cacheF1.circuiti.set(circuito.circuitId, new Circuito(circuito.circuitId, circuito.circuitName, immagine,
    //       circuito.Location.lat, circuito.Location.long, circuito.Location.locality, circuito.Location.country));
    //   });
    // });

    //Controllo se bisogna fare altre richiete API
    if (this.cacheF1.circuiti.size < circuiti.MRData.total) {
      this.getTuttiCircuitiRicorsivo(offset + circuiti.MRData.CirtcuitTable.Circuits.length);
      //this.getTuttiCircuitiRicorsivo(this.cacheF1.circuiti.size);
    }
  });

  console.warn(this.cacheF1);
}


getTuttiPiloti() {
  this.getTuttiPilotiRicorsivo(0);
}
getPilota(id: string) {
  this.getDataF1Api(`https://ergast.com/api/f1/driver/${id}.json`, 0).subscribe((pilota: any) => {
    console.log(pilota);
    //Richiesta API per ottenere l'immagine del pilota
    this.getDataWikipedia([pilota.MRData.DriverTable.Drivers[0].url], this.imageSize).subscribe((wikiData: any) => {
      console.log(wikiData);

      let immagine: string;
      if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
      else
        immagine = this.placeholder;

      this.cacheF1.piloti.set(pilota.driverId,
        new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));
    });
  });
}
  private getTuttiPilotiRicorsivo(offset: number) {
  //Richiesta API per ottenere i piloti di F1
  this.getDataF1Api('https://ergast.com/api/f1/drivers.json', offset).subscribe((piloti: any) => {
    console.log(piloti);

    //Inserimento dei piloti nella cache
    piloti.MRData.DriverTable.Drivers.forEach((pilota: any) => {

      //Richiesta API wiki per ottenere le immagini di tutti i piloti
      this.getDataWikipedia([pilota.url], this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        let immagine: string;
        if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        else
          immagine = this.placeholder;

        this.cacheF1.piloti.set(pilota.driverId,
          new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));
      });
    });

    //Controllo se bisogna fare altre richiesta API
    if (this.cacheF1.piloti.size < piloti.MRData.total) {
      this.getTuttiPilotiRicorsivo(offset + piloti.MRData.DriverTable.Drivers.length);
      //this.getTuttiPilotiRicorsivo(this.cacheF1.piloti.size);
    }
  });
}

getTuttiCostruttori() {
  this.getTuttiCostruttoriRicorsivo(0);
}
getCostruttore(id: string) {
  this.getDataF1Api(`https://ergast.com/api/f1/constructors/${id}.json`, 0).subscribe((costruttore: any) => {
    console.log(costruttore);
    //Richiesta API per ottenere l'immagine del costruttore
    this.getDataWikipedia([costruttore.MRData.ConstructorTable.Constructors[0].url], this.imageSize).subscribe((wikiData: any) => {
      console.log(wikiData);

      let immagine: string;
      if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
        immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
      else
        immagine = this.placeholder;

      this.cacheF1.costruttori.set(costruttore.constructorId,
        new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
    });
  });
}
  private getTuttiCostruttoriRicorsivo(offset: number) {
  //Richiesta API per ottenere i costruttori di F1
  this.getDataF1Api('https://ergast.com/api/f1/constructors.json', offset).subscribe((costruttori: any) => {
    console.log(costruttori);

    //Inserimento dei costruttori nella cache
    costruttori.MRData.ConstructorTable.Constructors.forEach((costruttore: any) => {
      //Richiesta API wiki per ottenere le immagini di tutti i costruttori
      this.getDataWikipedia([costruttore.url], this.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        let immagine: string;
        if (wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source !== undefined)
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
        else
          immagine = this.placeholder;

        this.cacheF1.costruttori.set(costruttore.constructorId,
          new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
      });
    });

    //Controllo se bisogna fare altre richiesta API
    if (this.cacheF1.costruttori.size < costruttori.MRData.total) {
      this.getTuttiCostruttoriRicorsivo(offset + costruttori.MRData.ConstructorTable.Constructors.length);
    }
  });
}

  /*caricaGareStagione(anno: number, offset: number) {
    this.ApiService.getDataF1Api(`https://ergast.com/api/f1/${anno}.json`, offset).subscribe((gare: any) => {
      console.log(gare);

      gare.MRData.RaceTable.Races.forEach((gara: any) => {

        this.ApiService.getDataWikipedia([gara.Circuit.url], 250).subscribe((data: any) => {
          console.log(data);

          let urlImg : string;
          data.query.pages[data.query.pageids[0]].thumbnail.source ?
            urlImg = data.query.pages[data.query.pageids[0]].thumbnail.source : urlImg = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

          let circuito = new Circuito(gara.Circuit.circuitId, gara.Circuit.circuitName, urlImg,
            gara.Circuit.Location.lat, gara.Circuit.Location.long, gara.Circuit.Location.locality, gara.Circuit.Location.country);

          this.ApiService.cacheF1.stagioni.get(anno)?.gare.push(new Gara(gara.raceName, gara.round, new Date(Date.now()), circuito));
          this.sortedArray()[0].gare.push(new Gara(gara.raceName, gara.round, new Date(Date.now()), circuito));
          console.log(this.ApiService.cacheF1);
        });
      });
      
      // console.log(this.ApiService.cacheF1);
      // console.log(this.sortedArray());
    });
  }*/


}

export class CacheF1 {
  stagioni: Map<number, Stagione> = new Map<number, Stagione>();
  piloti: Map<string, Pilota> = new Map<string, Pilota>();
  costruttori: Map<string, Costruttore> = new Map<string, Costruttore>();
  circuiti: Map<string, Circuito> = new Map<string, Circuito>();
}