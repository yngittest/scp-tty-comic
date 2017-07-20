'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newHistory;

describe('History API:', function() {
  describe('GET /api/historys', function() {
    var historys;

    beforeEach(function(done) {
      request(app)
        .get('/api/historys')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          historys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      historys.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/historys', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/historys')
        .send({
          name: 'New History',
          info: 'This is the brand new history!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newHistory = res.body;
          done();
        });
    });

    it('should respond with the newly created history', function() {
      newHistory.name.should.equal('New History');
      newHistory.info.should.equal('This is the brand new history!!!');
    });
  });

  describe('GET /api/historys/:id', function() {
    var history;

    beforeEach(function(done) {
      request(app)
        .get(`/api/historys/${newHistory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          history = res.body;
          done();
        });
    });

    afterEach(function() {
      history = {};
    });

    it('should respond with the requested history', function() {
      history.name.should.equal('New History');
      history.info.should.equal('This is the brand new history!!!');
    });
  });

  describe('PUT /api/historys/:id', function() {
    var updatedHistory;

    beforeEach(function(done) {
      request(app)
        .put(`/api/historys/${newHistory._id}`)
        .send({
          name: 'Updated History',
          info: 'This is the updated history!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedHistory = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedHistory = {};
    });

    it('should respond with the updated history', function() {
      updatedHistory.name.should.equal('Updated History');
      updatedHistory.info.should.equal('This is the updated history!!!');
    });

    it('should respond with the updated history on a subsequent GET', function(done) {
      request(app)
        .get(`/api/historys/${newHistory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let history = res.body;

          history.name.should.equal('Updated History');
          history.info.should.equal('This is the updated history!!!');

          done();
        });
    });
  });

  describe('PATCH /api/historys/:id', function() {
    var patchedHistory;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/historys/${newHistory._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched History' },
          { op: 'replace', path: '/info', value: 'This is the patched history!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedHistory = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedHistory = {};
    });

    it('should respond with the patched history', function() {
      patchedHistory.name.should.equal('Patched History');
      patchedHistory.info.should.equal('This is the patched history!!!');
    });
  });

  describe('DELETE /api/historys/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/historys/${newHistory._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when history does not exist', function(done) {
      request(app)
        .delete(`/api/historys/${newHistory._id}`)
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
