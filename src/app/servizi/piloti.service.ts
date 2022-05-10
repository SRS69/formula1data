import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { PostoClassificaPiloti, Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService, MapNO } from './cache.service';

/**
 * Servizio per richiedere i dati riguardanti i circuiti di F1
 */
@Injectable({
  providedIn: 'root'
})
export class PilotiService {

  constructor(private api: ApiService, private cache: CacheService) { }

  /**
   * Carica tutti i piloti in cache
   * @returns Mappa contennte i piloti
   */
  getTuttiPiloti(): MapNO<string, Pilota> {
    if (!this.cache.pilBool)
      this.getTuttiPilotiRicorsivo(0);

    return this.cache.piloti;
  }
  /**
   * Metodo ricorsivo per caricare tutti i piloti in cache
   * @param offset Scostamento dal primo pilota per la chiamata API
   */
  private getTuttiPilotiRicorsivo(offset: number) {
    if (!this.cache.pilBool) {
      //Richiesta API per ottenere i piloti di F1
      this.api.getDataF1Api('https://ergast.com/api/f1/drivers.json', offset).subscribe((piloti: any) => {
        console.log(piloti);

        //Richiesta API wiki per ottenere le immagini di tutti i circuiti
        this.api.getDataWikipedia(this.api.estraiTitoliDaVettoreGenerico(piloti.MRData.DriverTable.Drivers), this.api.imageSize).subscribe((wikiData: any) => {
          console.log(wikiData);

          //Inserimento dei piloti nella cache
          piloti.MRData.DriverTable.Drivers.forEach((pilota: any) => {
            if (!this.cache.piloti.has(pilota.driverId)) {
              //Link dell'immagine del pilota
              let immagine: string | undefined;
              immagine = wikiData.query.pages[wikiData.query.pageids[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([pilota.url])[0], wikiData)]]?.thumbnail?.source;
              if (immagine === undefined)
                immagine = this.api.placeholder;
              //Aggiunta del pilota alla cache
              this.cache.piloti.set(pilota.driverId,
                new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));
            }
          });
          //Controllo se bisogna fare altre richieste API
          if (this.cache.piloti.size < piloti.MRData.total && piloti.MRData.DriverTable.Drivers.length > 0) {
            this.getTuttiPilotiRicorsivo(offset + piloti.MRData.DriverTable.Drivers.length);
          } else {
            this.cache.pilBool = true;
          }

        });
      });
    }

    console.warn(this.cache);
  }
  /**
   * Carica un singolo pilota in cache
   * @param id ID del pilota da caricare
   */
  async getPilota(id: string): Promise<Pilota | undefined> {
    //Controllo se è già in cache
    if (this.cache.piloti.has(id))
      return this.cache.piloti.get(id);

    //Richiesta API per il pilota
    const pilota: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/drivers/${id}.json`, 0));
    console.log(pilota);

    //Richiesta API per ottenere l'immagine del pilota
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([pilota.MRData.DriverTable.Drivers[0].url]), this.api.imageSize))
    console.log(wikiData);

    //Link dell'immagine del pilota
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]]?.thumbnail?.source;
    if (immagine === undefined)
      immagine = this.api.placeholder;

    //Aggiunta del pilota alla cache
    this.cache.piloti.set(pilota.MRData.DriverTable.Drivers[0].driverId,
      new Pilota(pilota.MRData.DriverTable.Drivers[0].driverId, immagine, pilota.MRData.DriverTable.Drivers[0].givenName, pilota.MRData.DriverTable.Drivers[0].familyName, new Date(pilota.MRData.DriverTable.Drivers[0].dateOfBirth),
        pilota.MRData.DriverTable.Drivers[0].nationality, pilota.MRData.DriverTable.Drivers[0].permanentNumber, pilota.MRData.DriverTable.Drivers[0].code));

    return this.cache.piloti.get(id);
  }

  /**
   * Carica tutti i costruttori di un pilota in cache
   * @param id ID del pilota
   * @returns Array contenente tutti i costruttori del pilota
   */
  async getCostruttoriPilota(id: string): Promise<Set<Costruttore>> {
    //Prendo il pilota
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento dei costruttori del pilota");

    //Prendo i costruttori
    if (!pilota.costruttoriBool)
      this.loadCostruttoriPilotaRicorsivo(pilota, 0);

    return pilota.costruttori;
  }
  /**
   * Metodo ricorsivo per caricare tutti i costruttori di un pilota in cache
   * @param pilota Pilota da cui prendere i costruttori
   * @param offset Scosatmento dal primo costruttore
   */
  private loadCostruttoriPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.costruttoriBool) {
      //Richiesta API per ottenere i costruttori
      this.api.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/constructors.json`, offset).subscribe((costruttori: any) => {
        console.log(costruttori);

        //Inserisco i costruttori nella cache
        costruttori.MRData.ConstructorTable.Constructors.forEach(async (costruttoreFromData: any) => {
          //Prendo il costruttore
          let costruttore: Costruttore | undefined = this.cache.costruttori.get(costruttoreFromData.constructorId);
          //Se non è in cache lo estraggo e aggiungo
          if (costruttore === undefined) {
            //Richiesta API wiki per ottenere l'immagine del costruttore
            const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([costruttoreFromData.url]), this.api.imageSize));
            console.log(wikiData);
            //Link dell'immagine del costruttore
            let immagine: string | undefined;
            immagine = wikiData.query.pages[wikiData.query.pageids[0]]?.thumbnail?.source;
            if (immagine === undefined)
              immagine = this.api.placeholder;
            //Creazione del costruttore
            costruttore = new Costruttore(costruttoreFromData.constructorId, costruttoreFromData.name, immagine, costruttoreFromData.nationality);
            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.id, costruttore);
            costruttore = this.cache.costruttori.get(costruttore.id);
            if (!costruttore)
              throw new Error("Errore nel caricamento del costruttore");
          }

          //Aggiunta del costruttore alla lista del pilota
          pilota.costruttori.add(costruttore);
        });

        //Controllo se bisogna fare altre richieste API
        if (pilota.costruttori.size < costruttori.MRData.total && costruttori.MRData.ConstructorTable.Constructors.length > 0) {
          this.loadCostruttoriPilotaRicorsivo(pilota, offset + costruttori.MRData.ConstructorTable.Constructors.length);
        } else {
          pilota.costruttoriBool = true;
        }
      });
    }
    console.log(this.cache)
  }


  /**
   * Carica tutte le stagioni di un pilota in cache
   * @param id ID del pilota
   * @returns Mappa contenente i posti a fine delle stagioni del pilota
   */
  async getStagioniERisultatoPilota(id: string): Promise<MapNO<number, PostoClassificaPiloti>> {
    //Prendo il pillota
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Prendo le stagioni e posizioni
    if (!pilota.stagioniBool)
      this.loadStagioniERisultatoPilotaRicorsivo(pilota, 0);

    return pilota.stagioniERisultato;
  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni di un pilota in cache
   * @param pilota Pilota da cui prendere le stagioni e le posizioni
   * @param offset Discostamento dal primo risultato
   */
  private loadStagioniERisultatoPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.stagioniBool) {
      //Richiesta API per ottenere le stagioni e le posizioni
      this.api.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/driverStandings.json`, offset).subscribe((stagioniEPosizione: any) => {
        console.log(stagioniEPosizione);

        //Inserisco i risultati nella cache
        stagioniEPosizione.MRData.StandingsTable.StandingsLists.forEach(async (posizione: any) => {
          //Prendo la stagione
          let stagione: Stagione | undefined = this.cache.stagioni.get(parseInt(posizione.season));
          //Se non è in cache lo estraggo e aggiungo
          if (stagione === undefined) {
            //Creazione della stagione
            stagione = new Stagione(parseInt(posizione.season));
            //Aggiunta della stagione alla cache
            this.cache.stagioni.set(stagione.anno, stagione);
          }

          //Prendo la posizione
          let posizionePilota: PostoClassificaPiloti | undefined = stagione.classificaPiloti.get(parseInt(posizione.DriverStandings[0].position));
          //Se non è in cache lo estraggo e aggiungo
          if (posizionePilota === undefined) {
            //Prendo il costruttore
            let costruttore: Costruttore | undefined = this.cache.costruttori.get(posizione.DriverStandings[0].Constructors[0].constructorId);
            //Se non è in cache lo estraggo e aggiungo
            if (costruttore === undefined) {
              //Richiesta API wiki per ottenere l'immagine del costruttore
              const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([posizione.DriverStandings[0].Constructors[0].url]), this.api.imageSize));
              console.log(wikiData);
              //Link dell'immagine del costruttore
              let immagine: string | undefined;
              immagine = wikiData.query.pages[wikiData.query.pageids[0]]?.thumbnail?.source;
              if (immagine === undefined)
                immagine = this.api.placeholder;
              //Creazione del costruttore
              costruttore = new Costruttore(posizione.DriverStandings[0].Constructors[0].constructorId, posizione.DriverStandings[0].Constructors[0].name, immagine,
                posizione.DriverStandings[0].Constructors[0].nationality);
              //Aggiunta del costruttore alla cache
              this.cache.costruttori.set(costruttore.id, costruttore);
              costruttore = this.cache.costruttori.get(costruttore.id);
              if (!costruttore)
                throw new Error("Errore nel caricamento del costruttore");
            }
            //Creazione della posizione
            posizionePilota = new PostoClassificaPiloti(stagione, parseInt(posizione.DriverStandings[0].position),
              parseInt(posizione.DriverStandings[0].points), parseInt(posizione.DriverStandings[0].wins), costruttore, pilota);

            //Aggiunta della posizione alla cache
            stagione.classificaPiloti.set(posizionePilota.posizione, posizionePilota);
          }
          //Controllo se il pilota è arrivato primo
          if (posizionePilota.posizione == 1) {
            pilota.stagioniVinte++;
          }

          //Lo aggiungo alla cache del pilota
          pilota.stagioniERisultato.set(posizionePilota.stagione.anno, posizionePilota);
        });

        //Controllo se bisogna fare altre richieste API
        if (pilota.stagioniERisultato.size < stagioniEPosizione.MRData.total && stagioniEPosizione.MRData.StandingsTable.StandingsLists.length > 0) {
          this.loadStagioniERisultatoPilotaRicorsivo(pilota, offset + stagioniEPosizione.MRData.StandingsTable.StandingsLists.length);
        } else {
          pilota.stagioniBool = true;
        }
      });
    }
    console.log(pilota.stagioniERisultato);
  }


  /**
   * Completa il pilota richiesto
   * @param id Id del pilota
   * @returns Il pilota completato
   */
  async completaPilota(id: string): Promise<Pilota> {
    //Prendo il pilota
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Carico i costruttori
    this.getCostruttoriPilota(pilota.id);
    //Carico le stagioni e i risultati
    this.getStagioniERisultatoPilota(pilota.id);

    return pilota;
  }
}
