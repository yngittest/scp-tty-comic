'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newVol;

describe('Vol API:', function() {
  describe('GET /api/vols', function() {
    var vols;

    beforeEach(function(done) {
      request(app)
        .get('/api/vols')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          vols = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      vols.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/vols', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/vols')
        .send({
          name: 'New Vol',
          info: 'This is the brand new vol!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newVol = res.body;
          done();
        });
    });

    it('should respond with the newly created vol', function() {
      newVol.name.should.equal('New Vol');
      newVol.info.should.equal('This is the brand new vol!!!');
    });
  });

  describe('GET /api/vols/:id', function() {
    var vol;

    beforeEach(function(done) {
      request(app)
        .get(`/api/vols/${newVol._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          vol = res.body;
          done();
        });
    });

    afterEach(function() {
      vol = {};
    });

    it('should respond with the requested vol', function() {
      vol.name.should.equal('New Vol');
      vol.info.should.equal('This is the brand new vol!!!');
    });
  });

  describe('PUT /api/vols/:id', function() {
    var updatedVol;

    beforeEach(function(done) {
      request(app)
        .put(`/api/vols/${newVol._id}`)
        .send({
          name: 'Updated Vol',
          info: 'This is the updated vol!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedVol = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedVol = {};
    });

    it('should respond with the updated vol', function() {
      updatedVol.name.should.equal('Updated Vol');
      updatedVol.info.should.equal('This is the updated vol!!!');
    });

    it('should respond with the updated vol on a subsequent GET', function(done) {
      request(app)
        .get(`/api/vols/${newVol._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let vol = res.body;

          vol.name.should.equal('Updated Vol');
          vol.info.should.equal('This is the updated vol!!!');

          done();
        });
    });
  });

  describe('PATCH /api/vols/:id', function() {
    var patchedVol;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/vols/${newVol._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Vol' },
          { op: 'replace', path: '/info', value: 'This is the patched vol!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedVol = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedVol = {};
    });

    it('should respond with the patched vol', function() {
      patchedVol.name.should.equal('Patched Vol');
      patchedVol.info.should.equal('This is the patched vol!!!');
    });
  });

  describe('DELETE /api/vols/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/vols/${newVol._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when vol does not exist', function(done) {
      request(app)
        .delete(`/api/vols/${newVol._id}`)
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
