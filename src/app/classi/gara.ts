import { MapNO } from "../servizi/cache.service";
import { Circuito } from "./circuito";
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
    classificaGara: MapNO<number, PostoGara>;

    constructor(nome: string, round: number, data: Date, circuito: Circuito, stagione: Stagione) {
        this.nome = nome;
        this.round = round;
        this.data = data;
        this.circuito = circuito;
        this.stagione = stagione;

        this.classificaGaraBool = false;
        this.classificaQualificaBool = false;
        this.classificaGiriBool = false;

        this.classificaGara = new MapNO<number, PostoGara>();
    }
    
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////CLASSIFICA//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Classe che rappresenta un posto in una classifica che riguarda una gara
 */
export class PostoGara {
    readonly posizione: number;
    readonly pilota: Pilota;
    readonly gara: Gara;
    readonly punti: number;
    readonly griglia: number;
    readonly giri: number;
    readonly finito: boolean;
    readonly costruttore: Costruttore;
    readonly tempo?: Tempo;

    constructor(posizione: number, pilota: Pilota, costruttore: Costruttore, giri: number, griglia: number, punti: number, finito: boolean, gara: Gara, tempo?: Tempo) {
        this.posizione = posizione;
        this.pilota = pilota;
        this.gara = gara;
        this.costruttore = costruttore;
        this.giri = giri;
        this.griglia = griglia;
        this.tempo = tempo;
        this.punti = punti;
        this.finito = finito;
    }
}

export class Tempo {
    ore?: number;
    minuti?: number;
    secondi: number;
    millisecondi: number;

    /**
     * Partendo da una stringa in formato [ore:minuti:secondi.millesimi] (2:17:49.5)  costruisce un oggetto Tempo
     * 
     * @param tempo Stringa contenente il tempo
     */
    constructor(tempo: string) {
        //Divisione della stringa data in input
        let tempoVettore: string[] = tempo.split(":");
        //Separazione secondi e millisecondi
        let secMill: string[] = tempoVettore[tempoVettore.length - 1].split(".");

        //Assegnazione dei valori
        this.secondi = parseInt(secMill[0]);
        this.millisecondi = parseInt(secMill[1]);
        if (tempoVettore.length > 1) {
            this.minuti = parseInt(tempoVettore[tempoVettore.length - 2]);
            if (tempoVettore.length > 2) {
                this.ore = parseInt(tempoVettore[tempoVettore.length - 3]);
            }
        }
    }

    /**
     * Dando in input il tempo in millisecondi costruisce un oggetto Tempo
     * 
     * @param millisecondi Tempo in millisecondi
     * @returns Oggetto Tempo
     */
    static daMillisecondi(millisecondi: number): Tempo {
        //Oggetto Tempo base
        let tempo: Tempo = new Tempo("0:0:0.0");
        //Assegnazione dei valori
        tempo.millisecondi = millisecondi % 1000;
        tempo.secondi = Math.floor(millisecondi / 1000) % 60;
        tempo.minuti = Math.floor(millisecondi / 60000) % 60;
        tempo.ore = Math.floor(millisecondi / 3600000);

        //Riformattazione dell'oggetto se possibile
        if (tempo.ore === 0) {
            tempo.ore = undefined;
            if (tempo.minuti === 0) {
                tempo.minuti = undefined;
            }
        }

        return tempo;
    }

    /**
     * Costruisce una stringa in formato [ore:minuti:secondi.millesimi] (2:17:49.5), escludendo i valori nulli
     * @returns Oggetto Tempo in formato stringa
     */
    toString(): string {
        let tempo: string = "";
        if (this.ore) {
            tempo += this.ore + ":";
        }
        if (this.minuti) {
            tempo += this.minuti + ":";
        }
        tempo += this.secondi + "." + this.millisecondi;
        return tempo;
    }
}
