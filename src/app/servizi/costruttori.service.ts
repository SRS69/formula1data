import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { PostoClassificaCostruttori, Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService, MapNO } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CostruttoriService {

  constructor(private api: ApiService, private cache: CacheService) { }

  /**
   * Carica tutti i costruttori in cache
   * @returns Mappa contenente tutti i costruttori
   */
  getTuttiCostruttori(): MapNO<string, Costruttore> {
    if (!this.cache.costBool)
      this.loadTuttiCostruttoriRicorsivo(0);

    return this.cache.costruttori
  }
  /**
   * Metodo ricorsivo per caricare tutti i costruttori in cache
   * @param offset Scostamento dal primo costruttore per la chiamata API
   */
  private loadTuttiCostruttoriRicorsivo(offset: number) {
    //Richiesta API per ottenere i costruttori di F1
    this.api.getDataF1Api('https://ergast.com/api/f1/constructors.json', offset).subscribe((costruttori: any) => {
      console.log(costruttori);

      //Richiesta API wiki per ottenere le immagini di tutti i costruttori
      this.api.getDataWikipedia(this.api.estraiTitoliDaVettoreGenerico(costruttori.MRData.ConstructorTable.Constructors), this.api.imageSize).subscribe((wikiData: any) => {
        console.log(wikiData);

        //Inserimento dei costruttori nella cache
        costruttori.MRData.ConstructorTable.Constructors.forEach((costruttore: any) => {
          if (!this.cache.costruttori.has(costruttore.constructorId)) {
            //Link dell'immagine del costruttore
            let immagine: string = this.api.getImageUrlCostruttore(wikiData.query.pages[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([costruttore.url])[0], wikiData)], costruttore)
            //this.api.getImageUrlFromPage(wikiData.query.pages[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([costruttore.url])[0], wikiData)], [costruttore.constructorId, "logo"]);
            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.constructorId,
              new Costruttore(costruttore.constructorId, costruttore.name, immagine, costruttore.nationality));
          }
        });

        //Controllo se bisogna fare altre richieste API
        if (this.cache.costruttori.size < costruttori.MRData.total && costruttori.MRData.ConstructorTable.Constructors.length > 0) {
          this.loadTuttiCostruttoriRicorsivo(offset + costruttori.MRData.ConstructorTable.Constructors.length);
        } else {
          this.cache.costBool = true;
        }
      });
    });

    console.warn(this.cache);
  }
  /**
   * Carica un singolo costruttore in cache
   * @param id ID del costruttore da caricare
   */
  async getCostruttore(id: string): Promise<Costruttore | undefined> {
    //Controllo se il costruttore è già in cache
    if (this.cache.costruttori.has(id))
      return this.cache.costruttori.get(id);

    //Richiesta API per il costruttore
    const costruttore: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/constructors/${id}.json`, 0));
    console.log(costruttore);

    //Richiesta API per ottenere l'immagine del costruttore
    //const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([costruttore.MRData.ConstructorTable.Constructors[0].url]), this.api.imageSize));
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([costruttore.MRData.ConstructorTable.Constructors[0].url]), this.api.imageSize))
    console.log(wikiData);

    //Link dell'immagine del costruttore
    let immagine: string = this.api.getImageUrlCostruttore(wikiData.query.pages[wikiData.query.pageids[0]], costruttore.MRData.ConstructorTable.Constructors[0]);
    //this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [costruttore.MRData.ConstructorTable.Constructors[0].constructorId, "logo"]);

    //Aggiunta del costruttore alla cache
    this.cache.costruttori.set(costruttore.MRData.ConstructorTable.Constructors[0].constructorId,
      new Costruttore(costruttore.MRData.ConstructorTable.Constructors[0].constructorId, costruttore.MRData.ConstructorTable.Constructors[0].name, immagine, costruttore.MRData.ConstructorTable.Constructors[0].nationality));

    return this.cache.costruttori.get(id);
  }

  /**
   * Carica i piloti di un costruttore in cache
   * @param id ID del costruttore
   * @returns Array contenente tutti i piloti del costruttore
   */
  async getPilotiCostruttore(id: string): Promise<Set<Pilota>> {
    //Prendo il costruttore
    const costruttore: Costruttore | undefined = await this.getCostruttore(id);
    if (costruttore === undefined)
      throw new Error("Errore nel caricamento del costruttore");

    //Prendo i piloti
    if (!costruttore.pilotiBool)
      this.loadPilotiCostruttoreRicorsivo(costruttore, 0);

    return costruttore.piloti;
  }
  /**
   * Metodo ricorsivo per caricare i piloti di un costruttore in cache
   * @param costruttore Costruttore da cui prendere i piloti
   * @param offset Scostamento dal primo pilota
   */
  private loadPilotiCostruttoreRicorsivo(costruttore: Costruttore, offset: number) {
    if (!costruttore.pilotiBool) {
      //Richiesta API per ottenere i piloti
      this.api.getDataF1Api(`https://ergast.com/api/f1/constructors/${costruttore.id}/drivers.json`, offset).subscribe((piloti: any) => {
        console.log(piloti);

        //Inserisco i piloti nella cache
        piloti.MRData.DriverTable.Drivers.forEach(async (pilotaData: any) => {
          //Prendo il pilota
          let pilota: Pilota | undefined = this.cache.piloti.get(pilotaData.driverId);
          //Se non è in cache lo aggiungo
          if (pilota === undefined) {
            //Ruchiesta API wiki per ottenere l'immagine del pilota
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([pilotaData.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del pilota
            let immagine: string = this.api.getImageUrlPilota(wikiData.query.pages[wikiData.query.pageids[0]], pilotaData);
            //this.api.getImageUrlFromPage(wikiData.query.pages[wikiData.query.pageids[0]], [pilotaData.familyName]);
            //Creazione del pilota
            pilota = new Pilota(pilotaData.driverId, immagine, pilotaData.givenName, pilotaData.familyName, new Date(pilotaData.dateOfBirth),
              pilotaData.nationality, pilotaData.permanentNumber, pilotaData.code);
            //Aggiunta del pilota alla cache
            this.cache.piloti.set(pilota.id, pilota);
            pilota = this.cache.piloti.get(pilota.id);
            if (!pilota)
              throw new Error("Errore nel caricamento del pilota");
          }
          //Aggiunta del pilota alla lista del costruttore
          costruttore.piloti.add(pilota);
        });

        //Controllo se devo fare altre richieste
        if (costruttore.piloti.size < piloti.MRData.total && piloti.MRData.DriverTable.Drivers.length > 0) {
          this.loadPilotiCostruttoreRicorsivo(costruttore, offset + piloti.MRData.DriverTable.Drivers.length);
        } else {
          costruttore.pilotiBool = true;
        }
      });
    }
  }


  /**
   * Carica le stagioni di un costruttore in cache
   * @param id ID del costruttore
   * @returns Array contenente i posti le stagioni del costruttore
   */
  async getStagioniERisultatoCostruttore(id: string): Promise<MapNO<number, PostoClassificaCostruttori>> {
    //Prendo il costruttore
    const costruttore: Costruttore | undefined = await this.getCostruttore(id);
    if (costruttore === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Prendo le stagioni e posizioni
    if (!costruttore.stagioniBool)
      this.loadStagioniERisultatoCostruttoreicorsivo(costruttore, 0);

    return costruttore.stagioniEGare
  }
  private loadStagioniERisultatoCostruttoreicorsivo(costruttore: Costruttore, offset: number) {
    if (!costruttore.stagioniBool) {
      //Richiesta API per ottenere le stagioni
      this.api.getDataF1Api(`https://ergast.com/api/f1/constructors/${costruttore.id}/constructorStandings.json`, offset).subscribe((stagioniEPosizione: any) => {
        console.log(stagioniEPosizione);

        //Inserisco le stagioni e risultati nella cache
        stagioniEPosizione.MRData.StandingsTable.StandingsLists.forEach(async (posizione: any) => {
          //Prendo la stagione
          let stagione: Stagione | undefined = this.cache.stagioni.get(parseInt(posizione.season));
          //Se non è in cache lo aggiungo
          if (stagione === undefined) {
            //Creazione della stagione
            stagione = new Stagione(parseInt(posizione.season));
            //Aggiunta della stagione alla cache
            this.cache.stagioni.set(stagione.anno, stagione);

            stagione = this.cache.stagioni.get(stagione.anno);
            if(!stagione)
              throw new Error("Errore nel caricamento della stagione");
          }

          //Prendo la posizione
          let postoStagione: PostoClassificaCostruttori | undefined = stagione.classificaCostruttori.get(parseInt(posizione.ConstructorStandings[0].position));
          //Se non è in cache lo aggiungo
          if (postoStagione === undefined) {
            //Creazione della posizione
            postoStagione = new PostoClassificaCostruttori(stagione, parseInt(posizione.ConstructorStandings[0].position), parseInt(posizione.ConstructorStandings[0].points),
              parseInt(posizione.ConstructorStandings[0].wins), costruttore);
            //Aggiunta della posizione alla cache
            stagione.classificaCostruttori.set(postoStagione.posizione, postoStagione);
          }
          //Controllo se il costruttore è arrivato primo
          if (postoStagione.posizione == 1) {
            costruttore.stagioniVinte++;
          }
          //Aggiunta della posizione al costruttore
          costruttore.stagioniEGare.set(postoStagione.stagione.anno, postoStagione);
        });

        //Controllo se bisogna fare altre richieste API
        if (costruttore.stagioniEGare.size < stagioniEPosizione.MRData.total && stagioniEPosizione.MRData.StandingsTable.StandingsLists.length > 0) {
          this.loadStagioniERisultatoCostruttoreicorsivo(costruttore, offset + stagioniEPosizione.MRData.StandingsTable.StandingsLists.length);
        } else {
          costruttore.stagioniBool = true;
        }
      });
    }
  }

  /**
   * Completa il costruttore richiesto
   * @param id ID del costruttore
   * @returns Il costruttore completo
   */
  async completaCostruttore(id: string): Promise<Costruttore> {
    //Prendo il costruttore
    const costruttore: Costruttore | undefined = await this.getCostruttore(id);
    if (costruttore === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Carico i piloti
    this.getPilotiCostruttore(costruttore.id);
    //Carico le stagioni e i risultati
    this.getStagioniERisultatoCostruttore(costruttore.id);

    return costruttore;
  }
}
