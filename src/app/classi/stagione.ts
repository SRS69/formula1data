import { PostoClassifica } from "./classifica";
import { Costruttore } from "./costruttore";
import { Gara } from "./gara";
import { Pilota } from "./pilota";

export class Stagione {
    anno: number;

    constructor(anno: number) {
        this.anno = anno;

        this.gare = new Map<number, Gara>();
        this.classificaPiloti = new Map<number, PostoClassificaPiloti>();
        this.classificaCostruttori = new Map<number, PostoClassificaCostruttori>();
    }

    gare: Map<number, Gara>;
    classificaPiloti: Map<number, PostoClassificaPiloti>;
    classificaCostruttori: Map<number, PostoClassificaCostruttori>;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////CLASSIFICA//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Classe abstarct che rappresenta un posto in una classifica generica che riguarda una stagione di F1
 */
abstract class PostoClassificaStagione extends PostoClassifica {
    punti: number;
    vittorie: number;
    stagione: Stagione;
    costruttore: Costruttore;
    
    constructor(stagione:Stagione, posizione: number, punti: number, vittorie: number, costruttore: Costruttore) {
        super(posizione);
        this.stagione = stagione;
        this.punti = punti;
        this.vittorie = vittorie;
        this.costruttore = costruttore;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda i piloti
 */
class PostoClassificaPiloti extends PostoClassificaStagione {
    pilota: Pilota;

    constructor(stagione:Stagione, posizione: number, punti: number, vittorie: number, costruttore: Costruttore, pilota: Pilota) {
        super(stagione, posizione, punti, vittorie, costruttore);
        this.pilota = pilota;
    }
}
/**
 * Classe che rappresenta un posto in una classifica che riguarda i costruttori
 */
class PostoClassificaCostruttori extends PostoClassificaStagione {
    constructor(stagione:Stagione, posizione: number, punti: number, vittorie: number, costruttore: Costruttore) {
        super(stagione, posizione, punti, vittorie, costruttore);
    }
}
