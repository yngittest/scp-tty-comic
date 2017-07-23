'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var volCtrlStub = {
  index: 'volCtrl.index',
  show: 'volCtrl.show',
  create: 'volCtrl.create',
  upsert: 'volCtrl.upsert',
  patch: 'volCtrl.patch',
  destroy: 'volCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var volIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './vol.controller': volCtrlStub
});

describe('Vol API Router:', function() {
  it('should return an express router instance', function() {
    volIndex.should.equal(routerStub);
  });

  describe('GET /api/vols', function() {
    it('should route to vol.controller.index', function() {
      routerStub.get
        .withArgs('/', 'volCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/vols/:id', function() {
    it('should route to vol.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'volCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/vols', function() {
    it('should route to vol.controller.create', function() {
      routerStub.post
        .withArgs('/', 'volCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/vols/:id', function() {
    it('should route to vol.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'volCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/vols/:id', function() {
    it('should route to vol.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'volCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/vols/:id', function() {
    it('should route to vol.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'volCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
