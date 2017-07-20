'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('comic', {
      url: '/comic',
      template: '<comic></comic>'
    });
}
