'use strict';

var Book = require('../models/book');

exports.index = function(req, res){
  Book.findAll(req.session.userId, function(books){
    res.render('books/index', {title: 'Books', books: books});
  });
};

exports.new = function(req, res){
  res.render('books/new', {title: 'Add'});
};

exports.create = function(req, res){
  Book.create(req.body, req.files, req.session.userId, function(){
    res.redirect('/books');
  });
};

exports.stream = function(req, res){
  Book.getStream(req.params, req.session.userId, function(stream){
    stream.pipe(res);
  });
};
