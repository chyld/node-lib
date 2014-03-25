'use strict';

var Book = require('../models/book');

exports.index = function(req, res){
  Book.findAllByUserId(req.session.userId, function(books){
    res.render('books/index', {title: 'Books', books: books});
  });
};

exports.query = function(req, res){
  Book.findAllByUserIdAndQuery(req.session.userId, req.query, function(books){
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

exports.edit = function(req, res){
  Book.findByUserIdAndBookId(req.session.userId, req.params.id, function(book){
    res.render('books/edit', {title: 'Edit', book: book});
  });
};

exports.update = function(req, res){
  Book.findByUserIdAndBookId(req.session.userId, req.params.id, function(book){
    Book.update(req.body, book, function(){
      res.redirect('/books');
    });
  });
};

exports.stream = function(req, res){
  Book.getStream(req.params, req.session.userId, function(stream){
    stream.pipe(res);
  });
};
