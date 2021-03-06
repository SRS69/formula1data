import { MapNO } from "../servizi/cache.service";
import { Costruttore } from "./costruttore";
import { Gara } from "./gara";
import { Pilota } from "./pilota";

export class Stagione {
    anno: number;

    constructor(anno: number) {
        this.anno = anno;

        this.gare = new MapNO<number, Gara>();
        this.classificaPiloti = new MapNO<number, PostoClassificaPiloti>();
        this.classificaCostruttori = new MapNO<number, PostoClassificaCostruttori>();

        this.gareBool = false;
        this.classificaPilotiBool = false;
        this.classificaCostruttoriBool = false;
    }

    classificaPilotiBool: boolean;
    classificaCostruttoriBool: boolean;

    gareBool: boolean;
    gare: MapNO<number, Gara>;
    classificaPiloti: MapNO<number, PostoClassificaPiloti>;
    classificaCostruttori: MapNO<number, PostoClassificaCostruttori>;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////CLASSIFICA//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Classe che rappresenta un posto in una classifica che riguarda i piloti
 */
export class PostoClassificaPiloti {
    readonly stagione: Stagione;
    readonly posizione: number;
    readonly punti: number;
    readonly vittore: number;
    readonly costruttore: Costruttore;
    readonly pilota: Pilota;

    constructor(stagione:Stagione, posizione: number, punti: number, vittorie: number, costruttore: Costruttore, pilota: Pilota) {
        this.stagione = stagione;
        this.posizione = posizione;
        this.punti = punti;
        this.vittore = vittorie;
        this.costruttore = costruttore;
        this.pilota = pilota;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda i costruttori
 */
export class PostoClassificaCostruttori {
    readonly stagione: Stagione;
    readonly posizione: number;
    readonly punti: number;
    readonly vittore: number;
    readonly costruttore: Costruttore;

    constructor(stagione:Stagione, posizione: number, punti: number, vittorie: number, costruttore: Costruttore) {
        this.stagione = stagione;
        this.posizione = posizione;
        this.punti = punti;
        this.vittore = vittorie;
        this.costruttore = costruttore;
    }
}
