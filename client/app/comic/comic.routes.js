'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('comic', {
      url: '/',
      template: '<comic></comic>'
    });
}
