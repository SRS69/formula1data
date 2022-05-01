import { Classifica } from "./classifica";
import { Gara } from "./gara";

export class Stagione {
    anno: number;

    constructor(anno: number) {
        this.anno = anno;

        this.gare = new Map<number, Gara>();
    }

    gare: Map<number, Gara>;
    // classificaPiloti: Classifica;
    // classificaCostruttori: Classifica;

    
}
