import { MapNO } from "../servizi/cache.service";
import { Gara } from "./gara";

export class Circuito {

    id: string;
    nome: string;
    imgUrl: string;
    latitudine: number;
    longitudine: number;
    localita: string;
    paese: string;

    stagioniBool: boolean;
    vettoreStagioniGare: MapNO<number, Gara>;


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

        this.stagioniBool = false;
        this.vettoreStagioniGare = new MapNO<number, Gara>();
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


}
