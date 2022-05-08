import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gara } from 'src/app/classi/gara';
import { StagioniService } from 'src/app/servizi/stagioni.service';

@Component({
  selector: 'app-gara',
  templateUrl: './gara.component.html',
  styleUrls: ['./gara.component.css']
})
export class GaraComponent implements OnInit {

  selezione: Gara | undefined;
  constructor(private stagioniService: StagioniService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    let anno: number = parseInt(this.router.snapshot.params['id']);
    let round: number = parseInt(this.router.snapshot.params['idg']);
    if(anno && round) {
      this.selezionaGara(anno, round);
    }
  }

  private async selezionaGara(anno: number, round: number) {
    this.selezione = await this.stagioniService.getGaraStagione(anno, round);
    this.stagioniService.getClassificaGara(anno, round);
  }

}
