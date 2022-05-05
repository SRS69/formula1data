import { Circuito } from "./circuito";
import { PostoClassifica, Tempo } from "./classifica";
import { Costruttore } from "./costruttore";
import { Pilota } from "./pilota";
import { Stagione } from "./stagione";

export class Gara {
    nome: string;
    round: number;
    data: Date;
    circuito: Circuito;
    stagione: Stagione;

    classificaGaraBool: boolean;
    classificaQualificaBool: boolean;
    classificaGiriBool: boolean;
    classificaGara: Map<number, PostoGara>;
    classificaQualifica: Map<number, PostoClassifica>;
    //numero giro, posizione
    classificaGiri: Map<number, Map<number, PostoGiro>>;

    constructor(nome: string, round: number, data: Date, circuito: Circuito, stagione: Stagione) {
        this.nome = nome;
        this.round = round;
        this.data = data;
        this.circuito = circuito;
        this.stagione = stagione;

        this.classificaGaraBool = false;
        this.classificaQualificaBool = false;
        this.classificaGiriBool = false;

        this.classificaGara = new Map<number, PostoGara>();
        this.classificaQualifica = new Map<number, PostoClassifica>();
        this.classificaGiri = new Map<number, Map<number, PostoGiro>>();
    }
    
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////CLASSIFICA//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Classe abstarct che rappresenta un posto in una classifica generica che riguarda una gara di F1
 */
abstract class PostoClassificaGara extends PostoClassifica {
    pilota: Pilota;
    gara: Gara;

    constructor(posizione: number, pilota: Pilota, gara: Gara) {
        super(posizione);
        this.pilota = pilota;
        this.gara = gara;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda una gara
 */
export class PostoGara extends PostoClassificaGara {
    punti: number;
    griglia: number;
    giri: number;
    finito: boolean;
    costruttore: Costruttore;
    tempo?: Tempo;

    constructor(posizione: number, pilota: Pilota, costruttore: Costruttore, giri: number, griglia: number, punti: number, finito: boolean, gara: Gara, tempo?: Tempo) {
        super(posizione, pilota, gara);
        this.costruttore = costruttore;
        this.giri = giri;
        this.griglia = griglia;
        this.tempo = tempo;
        this.punti = punti;
        this.finito = finito;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda una qualifica per una gara
 */
export class PostoQualifica extends PostoClassificaGara {
    costruttore: Costruttore;
    Q1: Tempo;
    Q2?: Tempo;
    Q3?: Tempo;

    constructor(posizione: number, pilota: Pilota, costruttore: Costruttore, gara: Gara, Q1: Tempo, Q2?: Tempo, Q3?: Tempo) {
        super(posizione, pilota, gara);
        this.costruttore = costruttore;
        this.Q1 = Q1;
        this.Q2 = Q2;
        this.Q3 = Q3;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda un giro di una gara
 */
export class PostoGiro implements PostoClassificaGara {
    posizione: number;
    pilota: Pilota;
    gara: Gara;

    nGiro: number;
    tempo?: Tempo;

    constructor(nGiro: number, pilota: Pilota, posizione: number, gara: Gara, tempo?: Tempo) {
        this.nGiro = nGiro;
        this.pilota = pilota;
        this.posizione = posizione;
        this.gara = gara;
        this.tempo = tempo;
    }
}