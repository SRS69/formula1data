import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StagioniComponent } from './stagioni/stagioni.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule, Routes } from '@angular/router';
import { ListaCircuitiComponent } from './circuiti/lista-circuiti/lista-circuiti.component';
import { CircuitoComponent } from './circuiti/circuito/circuito.component';
import { ListaPilotiComponent } from './piloti/lista-piloti/lista-piloti.component';
import { PilotaComponent } from './piloti/pilota/pilota.component';
import { ListaCostruttoriComponent } from './costruttori/lista-costruttori/lista-costruttori.component';
import { CostruttoreComponent } from './costruttori/costruttore/costruttore.component';
import { GaraComponent } from './stagioni/gara/gara.component';
import { HomeComponent } from './home/home.component';

const ROTTE: Routes = [
  { path: '', component: HomeComponent },
  { path: 'stagione', component: StagioniComponent},
  { path: 'stagione/:id', component: StagioniComponent },
  { path: 'stagione/:id/:idg', component: GaraComponent },
  //{ path: 'circuito', component: ListaCircuitiComponent },
  { path: 'circuito/:id', component: CircuitoComponent },
  { path: 'pilota', component: ListaPilotiComponent },
  { path: 'pilota/:id', component: PilotaComponent },
  { path: 'costruttore', component: ListaCostruttoriComponent },
  { path: 'costruttore/:id', component: CostruttoreComponent },
]
@NgModule({
  declarations: [
    AppComponent,
    StagioniComponent,
    NavbarComponent,
    FooterComponent,
    ListaCircuitiComponent,
    CircuitoComponent,
    ListaPilotiComponent,
    PilotaComponent,
    ListaCostruttoriComponent,
    CostruttoreComponent,
    GaraComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(ROTTE)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
