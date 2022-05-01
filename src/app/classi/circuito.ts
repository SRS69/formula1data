import { ApiService } from "../servizi/api.service";
import { Gara } from "./gara";
import { Stagione } from "./stagione";

export class Circuito {

    id: string;
    nome: string;
    imgUrl: string;
    latitudine: number;
    longitudine: number;
    localita: string;
    paese: string;


    //constructor that can accept all parameters and use setters to validate them
    constructor(id: string, nome: string, imgUrl: string, latitudine: number, longitudine: number, localita: string, paese: string) {
        //this.imgUrl = this.checkWikipediaURL(imgUrl);
        this.imgUrl = imgUrl;
        this.latitudine = this.checkLatitudine(latitudine);
        this.longitudine = this.checkLongitudine(longitudine);
        this.id = id;
        this.nome = nome;
        this.localita = localita;
        this.paese = paese;
    }

    //function that can accept only valid wikipediaURL from wikipedia.org
    checkWikipediaURL(wikipediaURL: string) {
        if(wikipediaURL.indexOf('wikimedia.org') != -1)
            return wikipediaURL;

        throw new Error('URL di Wikimedia non valido');
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

    vettoreStagioniGare: Map<Stagione, Gara> = new Map<Stagione, Gara>();


}
