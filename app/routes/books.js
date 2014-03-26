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

exports.show = function(req, res){
  Book.findByUserIdAndBookId(req.session.userId, req.params.id, function(book){
    res.render('books/show', {title: 'Show', book: book});
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
      res.redirect('/books/' + book._id);
    });
  });
};

exports.stream = function(req, res){
  Book.findByUserIdAndBookId(req.session.userId, req.params.id, function(book){
    Book.getStream(book, req.params.filename, function(stream, type, length){
      res.setHeader('Content-Type', type);
      res.setHeader('Content-Length', length);
      try{stream.pipe(res);}catch(e){}
    });
  });
};
