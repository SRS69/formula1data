import { Gara } from "./gara";
import { Pilota } from "./pilota";
import { Stagione } from "./stagione";

export class Costruttore {
    id: string;
    nome: string;
    imgUrl: string;
    nazionalita: string;

    constructor(id: string, nome: string, imgUrl: string, nazionalita: string) {
        this.id = id;
        this.nome = nome;
        this.imgUrl = imgUrl;
        this.nazionalita = nazionalita;

        this.piloti = new Array<Pilota>();
        this.stagioniEGare = new Map<Map<number, Stagione>, Map<number, Gara>>();
    }

    piloti: Pilota[];
    stagioniVinte?: number;
    gareVinte?: number;


    //anno, stagione    round, gara
    stagioniEGare: Map<Map<number, Stagione>, Map<number, Gara>>;
}
