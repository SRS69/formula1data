import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../servizi/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
    return linkScomposto[0].toUpperCase() + ': ' + linkScomposto[1].toUpperCase();
  }

  //#faf1f2 --> bg-neutral-100 (bianco)
  //#295395 --> (blu)
  //#101011 --> (nero)
  //#e10600 --> (rosso)
}
