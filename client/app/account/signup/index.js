'use strict';

import angular from 'angular';
import SignupController from './signup.controller';

export default angular.module('scpTtyComicApp.signup', [])
  .controller('SignupController', SignupController)
  .name;
