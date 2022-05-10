import { MapNO } from "../servizi/cache.service";
import { Costruttore } from "./costruttore";
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
        this.costruttori = new Set<Costruttore>();
        this.stagioniBool = false;
        this.stagioniERisultato = new MapNO<number, PostoClassificaPiloti>();

        this.stagioniVinte = 0;
    }

    costruttoriBool: boolean;
    costruttori: Set<Costruttore>;
    stagioniVinte: number;
    
    stagioniBool: boolean;
    stagioniERisultato: MapNO<number, PostoClassificaPiloti>;
}
