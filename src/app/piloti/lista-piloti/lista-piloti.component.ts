import { Component, OnInit } from '@angular/core';
import { Pilota } from 'src/app/classi/pilota';
import { MapNO } from 'src/app/servizi/cache.service';
import { PilotiService } from 'src/app/servizi/piloti.service';

@Component({
  selector: 'app-lista-piloti',
  templateUrl: './lista-piloti.component.html',
  styleUrls: ['./lista-piloti.component.css']
})
export class ListaPilotiComponent implements OnInit {

  mappaPiloti: MapNO<string, Pilota> | undefined;
  constructor(private pilotiService: PilotiService) {
  }

  ngOnInit(): void {
    this.mappaPiloti = this.pilotiService.getTuttiPiloti();
    console.log(this.mappaPiloti);
  }

}
