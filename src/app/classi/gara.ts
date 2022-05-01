import { Circuito } from "./circuito";

export class Gara {
    nome: string;
    round: number;
    data: Date;
    circuito: Circuito;

    constructor(nome: string, round: number, data: Date, circuito: Circuito) {
        this.nome = nome;
        this.round = round;
        this.data = data;
        this.circuito = circuito;
    }
}
