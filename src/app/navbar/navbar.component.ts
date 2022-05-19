import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../servizi/firebase.service';
import { Router } from '@angular/router';




@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public firebaseService: FirebaseService, public router: Router) { }

  ngOnInit(): void {
  }

  titloLink(link: string): string {
    const linkScomposto: string[] = link.split('/');
    if(linkScomposto.length < 3)
      throw new Error('Link non valido');
      
    let r: string = "";
    if(linkScomposto.length > 3) {
      r = "GARA: "  + linkScomposto[2].toUpperCase() + " - " + linkScomposto[3].toUpperCase();
    }
    else
      r = linkScomposto[1].toUpperCase() + ': ' + linkScomposto[2].toUpperCase();

    return r
  }

  //#faf1f2 --> bg-neutral-100 (bianco)
  //#295395 --> (blu)
  //#101011 --> (nero)
  //#e10600 --> (rosso)
}
