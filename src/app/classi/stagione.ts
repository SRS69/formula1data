import { HttpClient } from "@angular/common/http";

export class Stagione {
    // readonly anno: number;
    //https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=1950_Formula_One_season&piprop=thumbnail&pithumbsize=250
    //https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=250&titles=1950_Formula_One_season
    //https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=1950_Formula_One_season&piprop=thumbnail&pithumbsize=250
    //https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=Monza_Circuit&piprop=original
    //https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=Monza_Circuit&piprop=thumbnail&pithumbsize=2500
    //https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&indexpageids=1&titles=Monza_Circuit&piprop=thumbnail&pithumbsize=2500

    // readonly wikipediaURL: string;
    // readonly wikipediaImgURL: string;

    // constructor(anno: number, wikipediaURL: string) {
    //     this.anno = anno;
    //     this.wikipediaURL = wikipediaURL;

    //     let tmp = wikipediaURL.split('/');
    //     this.wikipediaImgURL = tmp[tmp.length-1];
    // }

    private static limit: number = 1000;
    private static offset: number = 0;
    private static total: number;
    private static http: HttpClient;

    readonly anno: number;
    readonly linkWikipedia: string;

    constructor(anno: number, linkWikipedia: string) {
        this.anno = anno;
        this.linkWikipedia = linkWikipedia;
    }
        


    //set for limit that can accet number beetween 30 and 1000
    static setLimit(limit: number) {
        if(limit >= 30 && limit <= 1000)
            Stagione.limit = limit;
    }

    //Set for total taht can accepts number higher than 0
    static setTotal(total: number) {
        if(total >= 0)
            Stagione.total = total;
    }

    // static getDatiStagioni(offset: number) {
    //     this.http.get('https://ergast.com/api/f1/seasons.json?limit=' + this.limit + '&offset='+ this.offset).subscribe((dati) => {
    //       console.log(dati);
    //       this.vettoreDati = dati;
    //       console.log(this.linksImg);
    
    //       this.downloadImages(this.allImages(this.vettoreDati.MRData.SeasonTable.Seasons));
    
    //       //this.testImg(this.vettoreDati.MRData.SeasonTable.Seasons[0].url);
    //       /*(this.vettoreDati.MRData.SeasonTable.Seasons).forEach((stagione: any) => {
    //         console.log(stagione.url);
    //         //this.testImg(stagione.url, stagione.season);
    //         //console.log(this.mappetta);
            
    //       });*/
    //       //console.log("sussy= " + this.mappetta.get(1950));
    //     });
    //   }
}
