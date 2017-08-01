'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var bannerCtrlStub = {
  index: 'bannerCtrl.index',
  show: 'bannerCtrl.show',
  create: 'bannerCtrl.create',
  upsert: 'bannerCtrl.upsert',
  patch: 'bannerCtrl.patch',
  destroy: 'bannerCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var bannerIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './banner.controller': bannerCtrlStub
});

describe('Banner API Router:', function() {
  it('should return an express router instance', function() {
    bannerIndex.should.equal(routerStub);
  });

  describe('GET /api/banners', function() {
    it('should route to banner.controller.index', function() {
      routerStub.get
        .withArgs('/', 'bannerCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/banners/:id', function() {
    it('should route to banner.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'bannerCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/banners', function() {
    it('should route to banner.controller.create', function() {
      routerStub.post
        .withArgs('/', 'bannerCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/banners/:id', function() {
    it('should route to banner.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'bannerCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/banners/:id', function() {
    it('should route to banner.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'bannerCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/banners/:id', function() {
    it('should route to banner.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'bannerCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
