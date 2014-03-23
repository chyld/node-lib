'use strict';

var Book = require('../models/book');
var fs = require('fs');

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
  fs.createReadStream(Book.getPath(req.params, req.session.userId)).pipe(res);
};
