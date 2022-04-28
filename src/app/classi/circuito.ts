import { HttpClient } from "@angular/common/http";
import { Stagione } from "./stagione";

export class Circuito {

    readonly id: string;
    readonly nome: string;
    readonly wikipediaURL: string;
    readonly latitudine: number;
    readonly longitudine: number;
    readonly localita: string;
    readonly paese: string;
    private static http: HttpClient;

    //constructor that can accept all parameters and use setters to validate them
    constructor(id: string, nome: string, wikipediaURL: string, latitudine: number, longitudine: number, localita: string, paese: string, http: HttpClient) {
        this.wikipediaURL = this.checkWikipediaURL(wikipediaURL);
        this.latitudine = this.checkLatitudine(latitudine);
        this.longitudine = this.checkLongitudine(longitudine);
        this.id = id;
        this.nome = nome;
        this.localita = localita;
        this.paese = paese;
        Circuito.http = http;
    }

    //function that can accept only valid wikipediaURL from wikipedia.org
    checkWikipediaURL(wikipediaURL: string) {
        if(wikipediaURL.indexOf('wikipedia.org') != -1)
            return wikipediaURL;

        throw new Error('URL di Wikipedia non valido');
    }

    //funcion that can only accept valid latitudine
    private checkLatitudine(latitudine: number) {
        if(latitudine >= -90 && latitudine <= 90)
            return latitudine;

        throw new Error('Latitudine non valida');
    }
     //funcion that can only accept valid longitudine
    private checkLongitudine(longitudine: number) {
        if(longitudine >= -180 && longitudine <= 180)
            return longitudine;

        throw new Error('Longitudine non valida');
    }

    //tempiPerOgniStagione: Array<Map<>>;
    //Tutte le stagioni

    //Lista delle stagioni
    vettoreStagioni: Map<number, Stagione> = new Map<number, Stagione>();
    static readonly limit: number = 1000;
    private numberDownloaded: number = 0;
    downloadStagioni(offset: number) {
        Circuito.http.get('https://ergast.com/api/f1/circuits/' + this.id + '/seasons.json?limit=' + Circuito.limit +'&offset='+offset).subscribe((stagioni: any) => {
            if(stagioni.MRData.total >=  Circuito.limit) {
                this.numberDownloaded += Circuito.limit;
                this.downloadStagioni(this.numberDownloaded);
            }
            
            (stagioni.MRData.SeasonTable.Seasons).forEach((stagione : any) => {
                this.vettoreStagioni.set(stagione.season, new Stagione(stagione.season, stagione.url));
            });
        });
    }


}
