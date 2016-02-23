'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Report = mongoose.model('Report'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, report;

/**
 * Report routes tests
 */
describe('Report CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new report
    user.save(function () {
      report = {
        title: 'Report Title',
        content: 'Report Content'
      };

      done();
    });
  });

  it('should be able to save an report if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new report
        agent.post('/api/reports')
          .send(report)
          .expect(200)
          .end(function (reportSaveErr, reportSaveRes) {
            // Handle report save error
            if (reportSaveErr) {
              return done(reportSaveErr);
            }

            // Get a list of reports
            agent.get('/api/reports')
              .end(function (reportsGetErr, reportsGetRes) {
                // Handle report save error
                if (reportsGetErr) {
                  return done(reportsGetErr);
                }

                // Get reports list
                var reports = reportsGetRes.body;

                // Set assertions
                (reports[0].user._id).should.equal(userId);
                (reports[0].title).should.match('Report Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an report if not logged in', function (done) {
    agent.post('/api/reports')
      .send(report)
      .expect(403)
      .end(function (reportSaveErr, reportSaveRes) {
        // Call the assertion callback
        done(reportSaveErr);
      });
  });

  it('should not be able to save an report if no title is provided', function (done) {
    // Invalidate title field
    report.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new report
        agent.post('/api/reports')
          .send(report)
          .expect(400)
          .end(function (reportSaveErr, reportSaveRes) {
            // Set message assertion
            (reportSaveRes.body.message).should.match('Title cannot be blank');

            // Handle report save error
            done(reportSaveErr);
          });
      });
  });

  it('should be able to update an report if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new report
        agent.post('/api/reports')
          .send(report)
          .expect(200)
          .end(function (reportSaveErr, reportSaveRes) {
            // Handle report save error
            if (reportSaveErr) {
              return done(reportSaveErr);
            }

            // Update report title
            report.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing report
            agent.put('/api/reports/' + reportSaveRes.body._id)
              .send(report)
              .expect(200)
              .end(function (reportUpdateErr, reportUpdateRes) {
                // Handle report update error
                if (reportUpdateErr) {
                  return done(reportUpdateErr);
                }

                // Set assertions
                (reportUpdateRes.body._id).should.equal(reportSaveRes.body._id);
                (reportUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of reports if not signed in', function (done) {
    // Create new report model instance
    var reportObj = new Report(report);

    // Save the report
    reportObj.save(function () {
      // Request reports
      request(app).get('/api/reports')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single report if not signed in', function (done) {
    // Create new report model instance
    var reportObj = new Report(report);

    // Save the report
    reportObj.save(function () {
      request(app).get('/api/reports/' + reportObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', report.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single report with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reports/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Report is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single report which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent report
    request(app).get('/api/reports/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No report with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an report if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new report
        agent.post('/api/reports')
          .send(report)
          .expect(200)
          .end(function (reportSaveErr, reportSaveRes) {
            // Handle report save error
            if (reportSaveErr) {
              return done(reportSaveErr);
            }

            // Delete an existing report
            agent.delete('/api/reports/' + reportSaveRes.body._id)
              .send(report)
              .expect(200)
              .end(function (reportDeleteErr, reportDeleteRes) {
                // Handle report error error
                if (reportDeleteErr) {
                  return done(reportDeleteErr);
                }

                // Set assertions
                (reportDeleteRes.body._id).should.equal(reportSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an report if not signed in', function (done) {
    // Set report user
    report.user = user;

    // Create new report model instance
    var reportObj = new Report(report);

    // Save the report
    reportObj.save(function () {
      // Try deleting report
      request(app).delete('/api/reports/' + reportObj._id)
        .expect(403)
        .end(function (reportDeleteErr, reportDeleteRes) {
          // Set message assertion
          (reportDeleteRes.body.message).should.match('User is not authorized');

          // Handle report error error
          done(reportDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Report.remove().exec(done);
    });
  });
});
