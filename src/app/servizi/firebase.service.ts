import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export interface Utente {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  favourites: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  //Record dell'utente (aggiornato) nel database
  utente: Observable<Utente | null | undefined>;

  constructor(public afAuth: AngularFireAuth, private afirestore: AngularFirestore, private router: Router) {
    //Assegna il valore al record di utente corrente se è loggato
    this.utente = this.afAuth.authState.pipe(
      switchMap(user => {
        //Se è loggato restituisce il record dell'utente
        if (user) {
          return this.afirestore.doc<Utente>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Fa il login con google
   */
  async googleSignin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    this.inizializzaUtente(credential.user);
  }
  /**
   * Esegue il logout
   */
  async signOut() {
    await this.afAuth.signOut();
  }

  /**
   * Inizializza un utente
   * @param user Utente loggato
   */
  private async inizializzaUtente(user: firebase.User | null) {
    if (user == null)
      throw new Error("Utente non loggato");

    //Prendo il documento dell'utente
    const documentoUtente: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${user.uid}`);

    //Prendo l'utente correntemente caricato nel database
    let utenteCorrente: Utente | undefined;
    await documentoUtente.ref.get().then(snapshot => utenteCorrente = snapshot.data());
    console.log(utenteCorrente);

    //Prendo i favoriti dell'utente corentemente caricato
    let favoritiUtenteCorrente: string[];
    if (utenteCorrente && utenteCorrente.favourites) {
      favoritiUtenteCorrente = utenteCorrente.favourites;
    } else {
      favoritiUtenteCorrente = [];
    }

    //Metto le informazioni dell'utente in un oggetto
    const utente: Utente = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL ? user.photoURL : "https://c.tenor.com/EBbGfZGzWbIAAAAC/ben-talking-ben.gif",
      favourites: favoritiUtenteCorrente
    };

    //Carico le informazioni dell'utente nel database
    documentoUtente.set(utente, { merge: true });
  }

  /**
   * Aggiunge la rotta corrente alla lista dei preferiti
   */
  async addFavourite() {
    //Prendo l'utente attualmente loggato
    const utenteCorrente: firebase.User | null = await this.afAuth.currentUser;
    if(utenteCorrente == null)
      throw new Error("Utente non loggato");

    //Prendo il suo documento
    const documentoUtente: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${utenteCorrente.uid}`);
    const refDocUtente: DocumentReference<Utente> = documentoUtente.ref;

    //Aggiungo il preferito
    await updateDoc(refDocUtente, {
      favourites: arrayUnion(this.router.url)
    });
  }
  /**
   * Rimuove la rotta corrente dalla lista dei preferiti
   */
  async removeFavourite() {
    //Prendo l'utente attualmente loggato
    const utenteCorrente: firebase.User | null = await this.afAuth.currentUser;
    if(utenteCorrente == null)
      throw new Error("Utente non loggato");

    //Prendo il suo documento
    const documentoUtente: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${utenteCorrente.uid}`);
    const refDocUtente: DocumentReference<Utente> = documentoUtente.ref;
    //Rimuovo il preferito
    await updateDoc(refDocUtente, {
      favourites: arrayRemove(this.router.url)
    });
  }

  /**
   * Controlla se la rotta corernte è tra i preferiti dell'utente
   * @returns True se la rotta corrente è tra i preferiti, altrimenti false
   */
  async isPreferito(): Promise<boolean> {
    //Prendo l'utente attualmente loggato
    const utenteCorrente: firebase.User | null = await this.afAuth.currentUser;
    if(utenteCorrente == null)
      throw new Error("Utente non loggato");

    //Prendo il suo documento
    const documentoUtente: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${utenteCorrente.uid}`);

    //Prendo i favoriti dell'utente
    let utenteCorrenteDatabase: Utente | undefined;
    await documentoUtente.ref.get().then(snapshot => utenteCorrenteDatabase = snapshot.data());
    let favoritiUtenteCorrente: string[];
    if (utenteCorrenteDatabase && utenteCorrenteDatabase.favourites) {
      favoritiUtenteCorrente = utenteCorrenteDatabase.favourites;
    } else {
      favoritiUtenteCorrente = [];
    }

    //Controllo se la rotta corrente è nella lista dei preferiti
    return favoritiUtenteCorrente.includes(this.router.url);
  }

}