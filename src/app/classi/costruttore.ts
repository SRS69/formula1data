import { Gara } from "./gara";
import { Pilota } from "./pilota";
import { PostoClassificaCostruttori, Stagione } from "./stagione";

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

        this.pilotiBool = false;
        this.piloti = new Array<Pilota>();
        this.stagioniBool = false;
        this.stagioniEGare = new Map<number, PostoClassificaCostruttori>();
    }

    pilotiBool: boolean;
    piloti: Pilota[];
    stagioniVinte?: number;
    gareVinte?: number;


    stagioniBool: boolean;
    //anno, stagione    round, gara
    stagioniEGare: Map<number, PostoClassificaCostruttori>;
}
