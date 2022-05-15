import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../servizi/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';




@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public firebaseService: FirebaseService) { }

  ngOnInit(): void {
  }

  login() {
    this.firebaseService.googleSignin();
  }

  //#faf1f2 --> bg-neutral-100 (bianco)
  //#295395 --> (blu)
  //#101011 --> (nero)
  //#e10600 --> (rosso)
}
