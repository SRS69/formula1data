FROM node:16-alpine

WORKDIR formula-1-data

COPY ..
RUN apk add git
RUN npm i
RUN npm i -g @angular/cli

EXPOSE 80