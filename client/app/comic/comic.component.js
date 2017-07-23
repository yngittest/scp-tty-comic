'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const filter = require('angular-filter');

import routes from './comic.routes';

export class ComicComponent {
  /*@ngInject*/
  constructor($http, socket) {
    this.$http = $http;
    this.socket = socket;
  }

  $onInit() {
    this.getHistory();
    this.getComics();
  }

  getHistory() {
    this.$http.get('/api/historys')
      .then(response => {
        this.history = response.data;
        this.socket.syncUpdates('history', this.history);
      });
  }

  getComics() {
    this.$http.get('/api/comics')
      .then(response => {
        this.comics = response.data;
        this.socket.syncUpdates('comic', this.comics);
      });
  }
}

export default angular.module('scpTtyComicApp.comic', [uiRouter, filter])
  .config(routes)
  .component('comic', {
    template: require('./comic.pug'),
    controller: ComicComponent,
    controllerAs: 'comicCtrl'
  })
  .name;
