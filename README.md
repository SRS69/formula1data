# Formula1Data

## Requisiti
- Angular (v. 13.3.2)
- Node (16 lts)

## Come avviarlo

- ### Github
    Si consiglia l'utilizzo di Docker. Dopo aver scaricato questa repository basta avviare un terminale nella cartella in cui si trova il `Dockerfile` e eseguire il comando `docker build . -t [nome-immagine]`. Dopo aver creato l'immagina bisognerà eseguire il comando `docker run -d -it --name [nome-container] [nome-immagine]`.
    
- ### DockerHub
    Se si ha accesso alla repository [DockerHub](https://hub.docker.com/repository/docker/srs69/formula1data) basterà scaricare l'ultima immagine caricata con il comando `docker pull srs69/formula1data:latest`, e dopo avviare il container con il comando `docker run -d -it --name [nome-container] srs69/formula1data:latest`.

Dopo aver creato e messo in esecuzione il container basterà aprire la console del container, se non lo si è già spostartsi in `/formula1data`, e eseguire il comando `ng serve`.


# Parte autogenerata da Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
