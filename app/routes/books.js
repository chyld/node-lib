'use strict';

var Book = require('../models/book');

exports.index = function(req, res){
  res.render('books/index', {title: 'Books'});
};

exports.new = function(req, res){
  res.render('books/new', {title: 'New Book'});
};

exports.create = function(req, res){
  Book.create(req.body, req.files, req.session.userId, function(){
    res.redirect('/books');
  });
};
