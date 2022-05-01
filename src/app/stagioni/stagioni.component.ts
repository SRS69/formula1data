import { Component, OnInit } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { Gara } from '../classi/gara';
import { Stagione } from '../classi/stagione';
import { ApiService } from '../servizi/api.service';

@Component({
  selector: 'app-stagioni',
  templateUrl: './stagioni.component.html',
  styleUrls: ['./stagioni.component.css']
})
export class StagioniComponent implements OnInit {

  indiceCorrente: number;
  data: Date;
  
  //chacheStagioni: Map<number, Stagione>;
  //chacheStagioni: Stagione[];
  constructor(private ApiService: ApiService) {
    //this.chacheStagioni = new Map<number, Stagione>();
    //this.chacheStagioni = new Array<Stagione>();
    this.indiceCorrente = 0;
    this.data = new Date("1932-07-10 15:00:00Z");
    
  }

  ngOnInit(): void {
    //this.getTutteStagioni();
  }

  caricato(): boolean {
    return this.ApiService.cacheF1.stagioni.size > 0;
  }

  sortedArray(): Stagione[] {
    console.log("reload vettore :)");
    return Array.from(this.ApiService.cacheF1.stagioni.values()).sort((a, b) => a.anno > b.anno ? -1 : 1);
  }

  getTutteStagioni() {
    this.getStagioni(0);
  }

  stampa() {
    //console.log(this.chacheStagioni.keys().next().value);
    //console.log(this.ApiService.cacheF1.stagioni.delete(2022));
    //this.chacheStagioni.clear();
    this.ApiService.cacheF1.stagioni.clear();
    //console.log(this.chacheStagioni);
    console.log(this.ApiService.cacheF1);
  }
  private getStagioni(offset: number) {
    //Richiesta API per ottenere le stagioni di F1
    this.ApiService.getDataF1Api('https://ergast.com/api/f1/seasons.json', offset).subscribe((stagioni: any) => {
      console.log(stagioni);

      //Inseriemento delle stagioni nella cache
      stagioni.MRData.SeasonTable.Seasons.forEach((stagione: any) => {
        this.ApiService.cacheF1.stagioni.set(stagione.season, new Stagione(stagione.season));
      });

      //Controllo se bisogna fare altre chiamate API (API funziona con un sistema di paging)
      if(this.ApiService.cacheF1.stagioni.size < stagioni.MRData.total) {
        this.getStagioni(this.ApiService.cacheF1.stagioni.size);
      }

      //this.chacheStagioni = new Map<number, Stagione>([...this.ApiService.cacheF1.stagioni].sort((a, b) => a[0] > b[0] ? -1 : 1));
      //this.chacheStagioni = Array.from(this.ApiService.cacheF1.stagioni.values()).sort((a, b) => a.anno > b.anno ? -1 : 1);
      //console.log(this.chacheStagioni);
    });

    //console.log(this.chacheStagioni);
    console.log(this.ApiService.cacheF1);
    
  }

  caricaGareStagione(anno: number, offset: number) {
    this.ApiService.getDataF1Api(`https://ergast.com/api/f1/${anno}.json`, offset).subscribe((gare: any) => {
      console.log(gare);

      gare.MRData.RaceTable.Races.forEach((gara: any) => {

        this.ApiService.getDataWikipedia([gara.Circuit.url], 250).subscribe((data: any) => {
          console.log(data);

          let urlImg : string;
          data.query.pages[data.query.pageids[0]].thumbnail.source ?
            urlImg = data.query.pages[data.query.pageids[0]].thumbnail.source : urlImg = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
          // try {
          //   urlImg = data.query.pages[data.query.pageids[0]].thumbnail.source ? urlImg = data.query.pages[data.query.pageids[1]].thumbnail.source
          // } catch (error) {
          //   urlImg = data.query.pages[data.query.pageids[1]].thumbnail.source;
          // }
          //data.query.pages[1219699].thumbnail.source
          //data.query.pageids[0]

          let circuito = new Circuito(gara.Circuit.circuitId, gara.Circuit.circuitName, urlImg,
            gara.Circuit.Location.lat, gara.Circuit.Location.long, gara.Circuit.Location.locality, gara.Circuit.Location.country);

          //this.ApiService.cacheF1.stagioni.get(anno)?.gare.push(new Gara(gara.raceName, gara.round, new Date(Date.now()), circuito));
          //this.sortedArray()[0].gare.push(new Gara(gara.raceName, gara.round, new Date(Date.now()), circuito));
          console.log(this.ApiService.cacheF1);
        });
      });
      
      // console.log(this.ApiService.cacheF1);
      // console.log(this.sortedArray());
    });
  }

}
