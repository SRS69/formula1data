import { Costruttore } from "./costruttore";
import { Gara } from "./gara";
import { Stagione } from "./stagione";

export class Pilota {
    readonly id: string;
    readonly numero: number;
    readonly abbreviazione: string;
    readonly imgUrl: string;
    readonly nome: string;
    readonly cognome: string;
    readonly dataDiNascita: Date;
    readonly nazionalita: string;

    constructor(id: string, numero: number, abbreviazione:string, imgUrl:string,
        nome:string, cognome: string, datadiNascita: Date, nazionalita: string) {
            this.id=id;
            this.numero = numero;
            this.abbreviazione = abbreviazione;
            this.imgUrl = imgUrl;
            this.nome = nome;
            this.cognome = cognome;
            this.dataDiNascita = datadiNascita;
            this.nazionalita = nazionalita;
    }

    // gareVinte: number;
    // stagioniVinte: number;
    // costruttori: Costruttore[];
    // stagioniEGare: Map<Stagione, Gara[]>;
}
