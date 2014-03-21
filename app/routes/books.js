'use strict';

exports.index = function(req, res){
  res.render('books/index', {title: 'Books'});
};

exports.new = function(req, res){
  res.render('books/new', {title: 'New Book'});
};

exports.create = function(req, res){

};
