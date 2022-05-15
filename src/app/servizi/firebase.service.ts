import { Injectable } from '@angular/core';
import { GoogleAuthProvider, UserCredential } from 'firebase/auth';


import { AngularFireStorage } from "@angular/fire/compat/storage";

import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from "firebase/storage";
import { HttpClient } from '@angular/common/http';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';



// Info di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUHMLiX2sugAagg8skcI9rMKwaijsYXQ0",
  authDomain: "formula1data-28da4.firebaseapp.com",
  projectId: "formula1data-28da4",
  storageBucket: "formula1data-28da4.appspot.com",
  messagingSenderId: "1087560955797",
  appId: "1:1087560955797:web:4ce3ff3bb4c29ab26c689c",
  measurementId: "G-FPKYF7YJZ9"
};

const firebaseApp = initializeApp(firebaseConfig);
// Collegamento al bucket di Firebase Storage
const storage = getStorage(firebaseApp);
// Lista di ogni utente presente su Firebase
const listUsersRef = ref(storage);

export interface Utente {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favorites?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  user$: Observable<any>;


  isLogged: boolean = false;
  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore,
    public firebaseStorage: AngularFireStorage, private httpRequest: HttpClient) {

    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<Utente>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }
  async signOut() {
    await this.afAuth.signOut();
  }
  private updateUserData(user: any) {
    const userRef: AngularFirestoreDocument<Utente> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };

    console.log(this.user$);
    return userRef.set(data, { merge: true });
  }


  async GoogleAuth() {
    // Inizializzo il Provider Google per la richiesta di login
    return await this.AuthLogin(new GoogleAuthProvider());
  }

  /**
   * Login con Google Pop-Up
   * @param provider Provider Google
   * @returns nulla di importante
   */
  async AuthLogin(provider: firebase.auth.AuthProvider) {

    return await this.afAuth.signInWithPopup(provider).then((res) => {

      // Il login è avvenuto con successo; salvo i dati nella memoria del Browser
      localStorage.setItem('user', JSON.stringify(res));

      // Inizio l'aggiornamento dei dati dell'utente
      //this.whenUserLogged();

    }).catch((error) => {

      // Il login non è andato a buon fine
      console.error("Errore durante il login con Google\n\n", error);

      // Avvio la procedura di errore
      //this.errorReport(error);
    });

  }

  /**
* Procedura di Download dei dati da Firebase Storage
* @param infoBrowser Informazioni dell'utente
*/
  download(infoBrowser: any) {

    // Preparo un riferimento al file dell'utente
    const pathUser = ref(storage, '/' + infoBrowser.user.uid);

    // Genero un URL da dove poter ricavare i dati interessati
    getDownloadURL(pathUser).then((url) => {

      // Avvio la richiesta GET per scaricare i dati interessati
      this.httpRequest.get(url).subscribe(dati => {

        // I dati sono stati ricevuti correttamente
        console.log("Dati ricevuti da Firebase\n\n", dati);

        // Salvo i dati nelle informazioni dell'utente
        //this.infoUser = dati;

        // Aggiorno le informazioni dell'utente nell'interfaccia grafica
        //this.userInfo.aggiornaUI(true, this.infoUser);
      });
    });
  }

  /**
  * Procedura di Upload dei dati su Firebase Storage
  * @param userData Dati da caricare
  */
  async upload(userData: any) {

    // Preparo un riferimento al file dell'utente
    const pathUser = ref(storage, '/' + userData?.user.uid);

    // Preparo il pacchetto da importare su Firebase Storage
    var blob = new Blob([JSON.stringify(userData)], { type: "application/json" });

    // Carico i dati del Blob su Firebase Storage
    uploadBytes(pathUser, blob).then(() => {
      // I dati sono stati inviati correttamente
      console.log("Dati inviati su Firebase");
    }).catch((error) => {

      // Il caricamento su Firebase Storage non è andato a buon fine
      console.error("Errore durante l'invio dei dati su Firebase\n\n", error);

      // Avvio la procedura di errore
      //this.errorReport(error);
    });
  }

}