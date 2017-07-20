'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newComic;

describe('Comic API:', function() {
  describe('GET /api/comics', function() {
    var comics;

    beforeEach(function(done) {
      request(app)
        .get('/api/comics')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          comics = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      comics.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/comics', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/comics')
        .send({
          name: 'New Comic',
          info: 'This is the brand new comic!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newComic = res.body;
          done();
        });
    });

    it('should respond with the newly created comic', function() {
      newComic.name.should.equal('New Comic');
      newComic.info.should.equal('This is the brand new comic!!!');
    });
  });

  describe('GET /api/comics/:id', function() {
    var comic;

    beforeEach(function(done) {
      request(app)
        .get(`/api/comics/${newComic._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          comic = res.body;
          done();
        });
    });

    afterEach(function() {
      comic = {};
    });

    it('should respond with the requested comic', function() {
      comic.name.should.equal('New Comic');
      comic.info.should.equal('This is the brand new comic!!!');
    });
  });

  describe('PUT /api/comics/:id', function() {
    var updatedComic;

    beforeEach(function(done) {
      request(app)
        .put(`/api/comics/${newComic._id}`)
        .send({
          name: 'Updated Comic',
          info: 'This is the updated comic!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedComic = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedComic = {};
    });

    it('should respond with the updated comic', function() {
      updatedComic.name.should.equal('Updated Comic');
      updatedComic.info.should.equal('This is the updated comic!!!');
    });

    it('should respond with the updated comic on a subsequent GET', function(done) {
      request(app)
        .get(`/api/comics/${newComic._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let comic = res.body;

          comic.name.should.equal('Updated Comic');
          comic.info.should.equal('This is the updated comic!!!');

          done();
        });
    });
  });

  describe('PATCH /api/comics/:id', function() {
    var patchedComic;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/comics/${newComic._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Comic' },
          { op: 'replace', path: '/info', value: 'This is the patched comic!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedComic = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedComic = {};
    });

    it('should respond with the patched comic', function() {
      patchedComic.name.should.equal('Patched Comic');
      patchedComic.info.should.equal('This is the patched comic!!!');
    });
  });

  describe('DELETE /api/comics/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/comics/${newComic._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when comic does not exist', function(done) {
      request(app)
        .delete(`/api/comics/${newComic._id}`)
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
