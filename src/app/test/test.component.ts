import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Circuito } from '../classi/circuito';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(private http: HttpClient) {
    this.loaded = 0;
    this.mappetta = new Map<number, string>();
    this.circuitoTest = new Circuito("monza", "Autodromo Nazionale di Monza", "https://en.wikipedia.org/wiki/Monza_Circuit", 45.6156, 9.28111, "Monza", "Italy");
    this.circuitoTest2 = new Circuito("bahrain", "Bahrain International Circuit", "http://en.wikipedia.org/wiki/Bahrain_International_Circuit", 26.0325, 50.5106, "Sakhir", "Bahrain");
  }

  ngOnInit(): void {
    this.vettoreDati = undefined;
    this.loaded = 0;
  }

  loaded: number;
  vettoreDati: any;
  linksImg: string[] = [];
  testDati(offset: number) {
    this.http.get('https://ergast.com/api/f1/seasons.json?limit=10&offset='+offset).subscribe((dati) => {
      console.log(dati);
      this.vettoreDati = dati;
      console.log(this.linksImg);
      console.log(this.mappetta);

      //this.downloadImages(this.allImages(this.vettoreDati.MRData.SeasonTable.Seasons));

      //this.testImg(this.vettoreDati.MRData.SeasonTable.Seasons[0].url);
      (this.vettoreDati.MRData.SeasonTable.Seasons).forEach((stagione: any) => {
        //console.log(stagione.url);
        this.testImg(stagione.url, stagione.season);
        //console.log(this.mappetta);
        
      });
      //console.log("sussy= " + this.mappetta.get(1950));
    });
  }

  allImages(stagioni: any[]): string {
    let titoli: string = "";

    let tmpVector: [];
    //estrarre i titoli delle pagine Wikipedia
    for (let i = 0; i < stagioni.length; i++) {
      tmpVector = stagioni[i].url.split('/');
      titoli += tmpVector[tmpVector.length-1];
      if(i != stagioni.length-1)
        titoli += "%7C";
    }

    //"%7C"

    return titoli;
  }

  downloadImages(titoli: string) {
    console.log("titoli= " + titoli);
    this.http.get('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&prop=pageimages&piprop=thumbnail&pithumbsize=250&titles='+titoli)
      .subscribe((images : any) => {
        console.log(images);
        images.query.pageids.forEach((imgWiki: number) => {
          this.linksImg.push(images.query.pages[imgWiki].thumbnail.source);
          this.loaded++;
        });
      })
  }


  //img: any;
  mappetta: Map<number, string>;
  testImg(wikiURL: string, anno:number) {
    let tmp = wikiURL.split('/');
    wikiURL = tmp[tmp.length-1];
    console.log(wikiURL);
    this.http.get('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&prop=pageimages&piprop=thumbnail&pithumbsize=250&titles='+wikiURL)
      .subscribe((img : any) => {
        console.log(img + " - " + anno);
        this.linksImg.push(img.query.pages[img.query.pageids[0]].thumbnail.source);
        //this.mappetta.set(anno, img.query.pages[img.query.pageids[0]].thumbnail.source);
        this.mappetta.set(anno, img.query.pages[img.query.pageids[0]].thumbnail.source);
        this.loaded++;
      })
  }



  circuitoTest: Circuito;
  circuitoTest2: Circuito;
  testCircuito() {
    console.log(this.circuitoTest);
    console.log(this.circuitoTest2);
    //this.circuitoTest.downloadStagioni(0);
    //this.circuitoTest2.downloadStagioni(0);
    console.log(this.circuitoTest);
    console.log(this.circuitoTest2);
  }
}
