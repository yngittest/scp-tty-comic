'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
const filter = require('angular-filter');

import routes from './comic.routes';

export class ComicComponent {
  /*@ngInject*/
  constructor($http, socket, $filter) {
    this.$http = $http;
    this.socket = socket;
    this.$filter = $filter;
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
        this.comics = this.$filter('orderBy')(response.data, 'title');
        this.newComics = this.$filter('filter')(response.data, {new: true});
        this.socket.syncUpdates('comic', this.comics);
      });
  }

  updateComic(comic) {
    this.$http.put(`/api/comics/${comic._id}`, comic);
    this.getComics();
  }

  clearNew(comic) {
    comic.new = false;
    this.updateComic(comic);
  }

  clearNewAll() {
    for(let comic of this.newComics) {
      this.clearNew(comic);
    }
  }

  deleteComic(comic) {
    this.$http.delete(`/api/comics/${comic._id}`);
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
