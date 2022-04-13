FROM node:16-alpine

WORKDIR formula1data

COPY . .
RUN apk add git
RUN npm i
RUN npm i -g @angular/cli@13.3.2

EXPOSE 80
