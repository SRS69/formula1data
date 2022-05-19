import { MapNO } from "../servizi/cache.service";
import { Pilota } from "./pilota";
import { PostoClassificaCostruttori } from "./stagione";

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
        this.piloti = new Set<Pilota>();
        this.stagioniBool = false;
        this.stagioniEGare = new MapNO<number, PostoClassificaCostruttori>();

        this.stagioniVinte = 0;
    }

    pilotiBool: boolean;
    piloti: Set<Pilota>;

    stagioniVinte: number;

    stagioniBool: boolean;
    stagioniEGare: MapNO<number, PostoClassificaCostruttori>;
}
