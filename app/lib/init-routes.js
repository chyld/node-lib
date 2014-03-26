'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var users = require('../routes/users');
  var books = require('../routes/books');

  app.get('/', d, home.index);
  app.get('/users/new', d, users.new);
  app.post('/users', d, users.create);
  app.get('/login', d, users.login);
  app.post('/login', d, users.authenticate);
  app.get('/logout', d, users.logout);
  app.get('/books/new', d, books.new);
  app.post('/books', d, books.create);
  app.get('/books', d, books.index);
  app.get('/books/query', d, books.query);
  app.get('/books/:id', d, books.show);
  app.post('/books/:id', d, books.update);
  app.get('/books/:id/edit', d, books.edit);
  app.get('/books/:id/shelf', d, books.shelf);
  app.get('/books/stream/:id/:filename', d, books.stream);
  console.log('Routes Loaded');
  fn();
}
