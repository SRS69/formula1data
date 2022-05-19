import { Component, OnInit } from '@angular/core';
import { Costruttore } from 'src/app/classi/costruttore';
import { CacheService, MapNO } from 'src/app/servizi/cache.service';
import { CostruttoriService } from 'src/app/servizi/costruttori.service';

@Component({
  selector: 'app-lista-costruttori',
  templateUrl: './lista-costruttori.component.html',
  styleUrls: ['./lista-costruttori.component.css']
})
export class ListaCostruttoriComponent implements OnInit {

  mappaCostruttori: MapNO<string, Costruttore> | undefined;
  constructor(private costruttoriService: CostruttoriService, public cache: CacheService) { }

  ngOnInit(): void {
    this.mappaCostruttori = this.costruttoriService.getTuttiCostruttori();
    console.log(this.mappaCostruttori);
  }

}
