'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCart;

describe('Cart API:', function() {
  describe('GET /api/cart', function() {
    var carts;

    beforeEach(function(done) {
      request(app)
        .get('/api/cart')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          carts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      carts.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/cart', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/cart')
        .send({
          name: 'New Cart',
          info: 'This is the brand new cart!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCart = res.body;
          done();
        });
    });

    it('should respond with the newly created cart', function() {
      newCart.name.should.equal('New Cart');
      newCart.info.should.equal('This is the brand new cart!!!');
    });
  });

  describe('GET /api/cart/:id', function() {
    var cart;

    beforeEach(function(done) {
      request(app)
        .get(`/api/cart/${newCart._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          cart = res.body;
          done();
        });
    });

    afterEach(function() {
      cart = {};
    });

    it('should respond with the requested cart', function() {
      cart.name.should.equal('New Cart');
      cart.info.should.equal('This is the brand new cart!!!');
    });
  });

  describe('PUT /api/cart/:id', function() {
    var updatedCart;

    beforeEach(function(done) {
      request(app)
        .put(`/api/cart/${newCart._id}`)
        .send({
          name: 'Updated Cart',
          info: 'This is the updated cart!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCart = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCart = {};
    });

    it('should respond with the updated cart', function() {
      updatedCart.name.should.equal('Updated Cart');
      updatedCart.info.should.equal('This is the updated cart!!!');
    });

    it('should respond with the updated cart on a subsequent GET', function(done) {
      request(app)
        .get(`/api/cart/${newCart._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let cart = res.body;

          cart.name.should.equal('Updated Cart');
          cart.info.should.equal('This is the updated cart!!!');

          done();
        });
    });
  });

  describe('PATCH /api/cart/:id', function() {
    var patchedCart;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/cart/${newCart._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Cart' },
          { op: 'replace', path: '/info', value: 'This is the patched cart!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCart = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCart = {};
    });

    it('should respond with the patched cart', function() {
      patchedCart.name.should.equal('Patched Cart');
      patchedCart.info.should.equal('This is the patched cart!!!');
    });
  });

  describe('DELETE /api/cart/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/cart/${newCart._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when cart does not exist', function(done) {
      request(app)
        .delete(`/api/cart/${newCart._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
