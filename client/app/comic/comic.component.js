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
    this.getTitles();
  }

  getHistory() {
    this.$http.get('/api/historys')
      .then(response => {
        this.history = response.data;
        this.socket.syncUpdates('history', this.history);
      });
  }

  getTitles() {
    this.$http.get('/api/comics')
      .then(response => {
        this.titles = response.data;
        this.socket.syncUpdates('comic', this.titles);
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
