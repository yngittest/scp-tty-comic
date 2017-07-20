'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var comicCtrlStub = {
  index: 'comicCtrl.index',
  show: 'comicCtrl.show',
  create: 'comicCtrl.create',
  upsert: 'comicCtrl.upsert',
  patch: 'comicCtrl.patch',
  destroy: 'comicCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var comicIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './comic.controller': comicCtrlStub
});

describe('Comic API Router:', function() {
  it('should return an express router instance', function() {
    comicIndex.should.equal(routerStub);
  });

  describe('GET /api/comics', function() {
    it('should route to comic.controller.index', function() {
      routerStub.get
        .withArgs('/', 'comicCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/comics/:id', function() {
    it('should route to comic.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'comicCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/comics', function() {
    it('should route to comic.controller.create', function() {
      routerStub.post
        .withArgs('/', 'comicCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/comics/:id', function() {
    it('should route to comic.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'comicCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/comics/:id', function() {
    it('should route to comic.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'comicCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/comics/:id', function() {
    it('should route to comic.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'comicCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
