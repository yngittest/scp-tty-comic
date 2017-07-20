'use strict';

describe('Component: ComicComponent', function() {
  // load the controller's module
  beforeEach(module('scpTtyComicApp.comic'));

  var ComicComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ComicComponent = $componentController('comic', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
