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
import { Router } from '@angular/router';

import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";


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
  photoURL: string;
  displayName: string;
  favourites: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  //Record del Database
  utente: Observable<Utente | null | undefined>;


  preferiti: string[] | undefined;

  isLogged: boolean = false;
  constructor(public afAuth: AngularFireAuth, private afirestore: AngularFirestore, private router: Router) {

    //Quando è loggato carica il record dell'utente
    this.utente = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afirestore.doc<Utente>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    //return this.updateUserData(credential.user);
  }
  async signOut() {
    await this.afAuth.signOut();
  }

  loadUtente() {

  }

  private updateUserData(user: any) {
    const userRef: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${user.uid}`);

    const data: Utente = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      favourites: []
    };

    return userRef.set(data, { merge: true });
  }
  private addFavourite(user: any) {
    const userRef: AngularFirestoreDocument<Utente> = this.afirestore.doc(`users/${user.uid}`);
    //const userRef = doc(db, "cities", "DC");
    let preferiti: string[] = [];

    userRef.ref.update({
      favourites: firebase.firestore.FieldValue.arrayUnion(this.preferiti)
    });

    userRef.update({

    });
  }
  removeFavourite() {}

}