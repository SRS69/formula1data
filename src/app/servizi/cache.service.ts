import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { Stagione } from '../classi/stagione';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  stagBool: boolean = false;
  pilBool: boolean = false;
  costBool: boolean = false;
  circBool: boolean = false;

  stagioni: Map<number, Stagione>;
  piloti: Map<string, Pilota>;
  costruttori: Map<string, Costruttore>;
  circuiti: Map<string, Circuito>;

  constructor() {
    this.stagioni = new Map<number, Stagione>();
    this.piloti = new Map<string, Pilota>();
    this.costruttori = new Map<string, Costruttore>();
    this.circuiti = new Map<string, Circuito>();
  }
}
