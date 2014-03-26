'use strict';

var Book = require('../models/book');

exports.index = function(req, res){
  Book.query(req.session.userId, {}, function(books){
    res.render('books/index', {title: 'Book List', books: books});
  });
};

exports.query = function(req, res){
  Book.query(req.session.userId, req.query, function(books){
    res.render('books/index', {title: 'Book Query', books: books});
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
  Book.find(req.session.userId, req.params.id, function(book){
    res.render('books/show', {title: 'Show', book: book});
  });
};

exports.edit = function(req, res){
  Book.find(req.session.userId, req.params.id, function(book){
    res.render('books/edit', {title: 'Edit', book: book});
  });
};

exports.update = function(req, res){
  Book.find(req.session.userId, req.params.id, function(book){
    Book.update(req.body, book, function(){
      res.redirect('/books/' + book._id);
    });
  });
};

exports.shelf = function(req, res){
  Book.find(req.session.userId, req.params.id, function(book){
    Book.shelf(book, function(){
      res.redirect('/books/query?shelf=t');
    });
  });
};

exports.stream = function(req, res){
  Book.find(req.session.userId, req.params.id, function(book){
    Book.getStream(book, req.params.filename, function(stream, type, length){
      res.setHeader('Content-Type', type);
      res.setHeader('Content-Length', length);
      try{stream.pipe(res);}catch(e){}
    });
  });
};
