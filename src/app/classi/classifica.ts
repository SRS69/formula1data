import { Costruttore } from "./costruttore";
import { Gara } from "./gara";
import { Pilota } from "./pilota";

// /**
//  * Classe che rappresenta una classifica 
//  */
// export class Classifica {
//     classifica: Map<number, PostoClassifica>;

//     constructor() {
//         this.classifica = new Map<number, PostoClassifica>();
//     }
// }

/**
 * Classe abstarct che rappresenta un posto in una classifica generica
 */
export abstract class PostoClassifica {
    posizione: number;

    constructor(posizione: number) {
        this.posizione = posizione;
    }
}

/**
 * Classe per semplificare la gestione del tempo per l'API di F1
 */
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