import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //limite di dati per ogni richiesta F1
  private limit: number;

  constructor(private http: HttpClient) { 
    this.limit = 1000;
  }

  getDataF1Api(ApiUrl: string, offset:number) {
    return this.http.get(ApiUrl+`?limit=${this.limit}&offset=${offset}`);
  }

  getDataWikipedia(titoliPagine: string[], dimensioni: number) {
    return this.http.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&indexpageids=1&prop=pageimages&piprop=thumbnail&\
      pithumbsize=${dimensioni}}&\
      titles=${titoliPagine.join('%7C')}`);
  }
}
