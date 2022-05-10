import { Injectable } from '@angular/core';
import { Circuito } from '../classi/circuito';
import { Costruttore } from '../classi/costruttore';
import { Pilota } from '../classi/pilota';
import { Stagione } from '../classi/stagione';

/**
 * Classe che implementa una cache basica di dati
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  constructor() {
    this.stagioni = new MapNO<number, Stagione>();
    this.piloti = new MapNO<string, Pilota>();
    this.costruttori = new MapNO<string, Costruttore>();
    this.circuiti = new MapNO<string, Circuito>();
  }

  //Booleani per controllare se sono stati caricati tutti i dati base
  stagBool: boolean = false;
  pilBool: boolean = false;
  costBool: boolean = false;
  circBool: boolean = false;

  //Mappe contenenti i dati
  stagioni: MapNO<number, Stagione>;
  piloti: MapNO<string, Pilota>;
  costruttori: MapNO<string, Costruttore>;
  circuiti: MapNO<string, Circuito>;
}

/**
 * MapNO (Map Non Overwritable)
 * Mappa che non permetti di sovrascrivere i valori già inseriti
 */
export class MapNO<K, V> extends Map<K, V> {
  override set(key: K, value: V): this {
    if(!this.has(key))
      super.set(key, value);
    else
      console.warn("Override attempt on key: " + key);
    return this;
  }
}
