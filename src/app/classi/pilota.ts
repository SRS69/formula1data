import { Costruttore } from "./costruttore";
import { Gara } from "./gara";
import { PostoClassificaPiloti, Stagione } from "./stagione";

export class Pilota {
    id: string;
    numero?: number;
    abbreviazione?: string;
    imgUrl: string;
    nome: string;
    cognome: string;
    dataDiNascita: Date;
    nazionalita: string;

    constructor(id: string, imgUrl:string, nome:string, cognome: string,
        datadiNascita: Date, nazionalita: string, numero?: number, abbreviazione?:string) {
        this.id=id;
        this.numero = numero;
        this.abbreviazione = abbreviazione;
        this.imgUrl = imgUrl;
        this.nome = nome;
        this.cognome = cognome;
        this.dataDiNascita = datadiNascita;
        this.nazionalita = nazionalita;

        this.costruttoriBool = false;
        this.costruttori = new Array<Costruttore>();
        //this.stagioniEGare = new Map<Map<number, Stagione>, Map<number, Gara>>();
        this.stagioniERisultato = new Map<number, PostoClassificaPiloti>();
        this.stagioniBool = false;
    }

    costruttoriBool: boolean;
    gareVinte?: number;
    stagioniVinte?: number;
    costruttori: Costruttore[];
    
    //anno, stagione    round, gara
    //stagioniEGare: Map<Map<number, Stagione>, Map<number, Gara>>;
    //anno, stagione        nposizione, posizione
    stagioniBool: boolean;
    stagioniERisultato: Map<number, PostoClassificaPiloti>;
}
