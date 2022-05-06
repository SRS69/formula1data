import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { PostoClassificaPiloti, Stagione } from '../classi/stagione';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class PilotiService {

  constructor(private api: ApiService, private cache: CacheService) { }

  /**
   * Carica tutti i piloti in cache
   */
  async getTuttiPiloti(): Promise<Pilota[]> {
    if (!this.cache.pilBool)
      await this.getTuttiPilotiRicorsivo(0);

    return Array.from(this.cache.piloti.values());
  }
  /**
   * Metodo ricorsivo per caricare tutti i piloti in cache
   * @param offset Scostamento dal primo pilota per la chiamata API
   */
  private async getTuttiPilotiRicorsivo(offset: number) {

    //Richiesta API per ottenere i piloti di F1
    const piloti: any = await lastValueFrom(this.api.getDataF1Api('https://ergast.com/api/f1/drivers.json', offset));
    console.log(piloti);

    //Richiesta API wiki per ottenere le immagini di tutti i circuiti
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaVettoreGenerico(piloti.MRData.DriverTable.Drivers), this.api.imageSize));
    console.log(wikiData);

    //Inserimento dei piloti nella cache
    piloti.MRData.DriverTable.Drivers.forEach((pilota: any) => {

      //Link dell'immagine del pilota
      let immagine: string | undefined;
      immagine = wikiData.query.pages[wikiData.query.pageids[this.api.wikiFromTitleToId(this.api.estraiTitoliDaUrls([pilota.url])[0], wikiData)]]?.thumbnail.source;
      if (immagine === undefined)
        immagine = this.api.placeholder;

      //Aggiunta del pilota alla cache
      this.cache.piloti.set(pilota.driverId,
        new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth), pilota.nationality, pilota.permanentNumber, pilota.code));


      //Controllo se bisogna fare altre richieste API
      if (this.cache.piloti.size < piloti.MRData.total) {
        this.getTuttiPilotiRicorsivo(offset + piloti.MRData.DriverTable.Drivers.length);
      } else if (this.cache.piloti.size == piloti.MRData.total) {
        this.cache.pilBool = true;
      }
    });

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
    const pilota: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/driver/${id}.json`, 0));
    console.log(pilota);

    //Richiesta API per ottenere l'immagine del pilota
    const wikiData: any = await lastValueFrom(this.api.getDataWikipedia(this.api.estraiTitoliDaUrls([pilota.MRData.DriverTable.Drivers[0].url]), this.api.imageSize))
    console.log(wikiData);

    //Link dell'immagine del pilota
    let immagine: string | undefined;
    immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
    if (immagine === undefined)
      immagine = this.api.placeholder;

    //Aggiunta del pilota alla cache
    this.cache.piloti.set(pilota.driverId,
      new Pilota(pilota.driverId, immagine, pilota.givenName, pilota.familyName, new Date(pilota.dateOfBirth),
        pilota.nationality, pilota.permanentNumber, pilota.code));

    return this.cache.piloti.get(id);
  }

  /**
   * Carica tutti i costruttori di un pilota in cache
   * @param id ID del pilota
   * @returns Array contenente tutti i costruttori del pilota
   */
  async getCostruttoriPilota(id: string): Promise<Costruttore[]> {
    //Prendo il pilota
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento dei costruttori del pilota");

    //Prendo i costruttori
    if (!pilota.costruttoriBool)
      await this.loadCostruttoriPilotaRicorsivo(pilota, 0);

    return pilota.costruttori;
  }
  /**
   * Metodo ricorsivo per caricare tutti i costruttori di un pilota in cache
   * @param pilota Pilota da cui prendere i costruttori
   * @param offset Scosatmento dal primo costruttore
   */
  private async loadCostruttoriPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.costruttoriBool) {
      //Richiesta API per ottenere i costruttori
      const costruttori: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/constructors.json`, offset));
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
          immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
          if (immagine === undefined)
            immagine = this.api.placeholder;

          //Creazione del costruttore
          costruttore = new Costruttore(costruttoreFromData.constructorId, costruttoreFromData.name, immagine, costruttoreFromData.nationality);
          
          //Aggiunta del costruttore alla cache
          this.cache.costruttori.set(costruttore.id, costruttore);
        }

        //Aggiunta del costruttore alla lista del pilota
        pilota.costruttori.push(costruttore);
      });

      //Controllo se bisogna fare altre richieste API
      if (pilota.costruttori.length < costruttori.MRData.total) {
        this.loadCostruttoriPilotaRicorsivo(pilota, offset + costruttori.MRData.onstructorTable.Constructors.length);
      } else if (pilota.costruttori.length == costruttori.MRData.total) {
        pilota.costruttoriBool = true;
      }
    }
  }


  /**
   * Carica tutte le stagioni di un pilota in cache
   * @param id ID del pilota
   * @returns Array contenente i posti a fine delle stagioni del pilota
   */
  async getStagioniERisultatoPilota(id: string): Promise<PostoClassificaPiloti[]> {
    //Prendo il pillota
    const pilota: Pilota | undefined = await this.getPilota(id);
    if (pilota === undefined)
      throw new Error("Errore nel caricamento del pilota");

    //Prendo le stagioni e posizioni
    if (!pilota.stagioniBool)
      await this.loadStagioniERisultatoPilotaRicorsivo(pilota, 0);

    //Restituisco le posizioni ordinate per anno
    return Array.from(pilota.stagioniERisultato.values()).sort((
      a: PostoClassificaPiloti, b: PostoClassificaPiloti) => b.stagione.anno - a.stagione.anno);
  }
  /**
   * Metodo ricorsivo per caricare tutte le stagioni di un pilota in cache
   * @param pilota Pilota da cui prendere le stagioni e le posizioni
   * @param offset Discostamento dal primo risultato
   */
  private async loadStagioniERisultatoPilotaRicorsivo(pilota: Pilota, offset: number) {
    if (!pilota.stagioniBool) {
      //Richiesta API per ottenere le stagioni e le posizioni
      const stagioniEPosizione: any = await lastValueFrom(this.api.getDataF1Api(`https://ergast.com/api/f1/drivers/${pilota.id}/driverStandings.json`, offset));
      console.log(stagioniEPosizione);

      //Inserisco i risultati nella cache
      stagioniEPosizione.MRData.StandingsTable.StandingsLists.forEach(async (posizione: any) => {
        //Prendo la stagione
        let stagione: Stagione | undefined = this.cache.stagioni.get(posizione.season);
        //Se non è in cache lo estraggo e aggiungo
        if (stagione === undefined) {
          //Creazione della stagione
          stagione = new Stagione(posizione.season);
          //Aggiunta della stagione alla cache
          this.cache.stagioni.set(stagione.anno, stagione);
        }
        
        //Prendo la posizione
        let posizionePilota: PostoClassificaPiloti | undefined = stagione.classificaPiloti.get(posizione.DriverStandings[0].position);
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
            immagine = wikiData.query.pages[wikiData.query.pageids[0]].thumbnail.source;
            if (immagine === undefined)
              immagine = this.api.placeholder;

            //Creazione del costruttore
            costruttore = new Costruttore(posizione.DriverStandings[0].Constructors[0].constructorId, posizione.DriverStandings[0].Constructors[0].name, immagine,
              posizione.DriverStandings[0].Constructors[0].nationality);

            //Aggiunta del costruttore alla cache
            this.cache.costruttori.set(costruttore.id, costruttore);
          }
          //Creazione della posizione
          posizionePilota = new PostoClassificaPiloti(stagione, posizione.DriverStandings[0].position,
            posizione.DriverStandings[0].points, posizione.DriverStandings[0].wins, costruttore, pilota);

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
      if (pilota.stagioniERisultato.size < stagioniEPosizione.MRData.total) {
        this.loadStagioniERisultatoPilotaRicorsivo(pilota, offset + stagioniEPosizione.MRData.StandingsTable.StandingsLists.length);
      } else if (pilota.stagioniERisultato.size == stagioniEPosizione.MRData.total) {
        pilota.stagioniBool = true;
      }
    }
  }

}
