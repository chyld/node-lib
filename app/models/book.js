'use strict';

module.exports = Book;
var books = global.nss.db.collection('books');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Mongo = require('mongodb');

function Book(){
}

Book.create = function(bobj, fobj, userId, cb){
  var book = new Book();

  book._id = Mongo.ObjectID();
  book.userId = Mongo.ObjectID(userId);

  book.title = bobj.title.trim();
  book.summary = bobj.summary.trim();
  book.publisher = bobj.publisher.trim();
  book.released = bobj.released.trim();
  book.edition = bobj.edition.trim();
  book.isbn10 = bobj.isbn10.trim();
  book.isbn13 = bobj.isbn13.trim();

  book.tags = bobj.tags.split(',').map(function(t){return t.trim();});
  book.tags = _.compact(book.tags);
  book.authors = bobj.authors.split(',').map(function(a){return a.trim();});
  book.authors = _.compact(book.authors);

  book.file = parseFile(fobj.file, 'book', userId, book._id.toString());
  book.cover = parseFile(fobj.cover, 'cover', userId, book._id.toString());

  insert(book, function(){
    cb();
  });
};

function insert(book, cb){
  books.insert(book, function(err, records){
    cb();
  });
}

function parseFile(file, name, userId, bookId){
  var files = __dirname + '/../files';
  var users = files + '/' + userId;
  var books = users + '/' + bookId;
  var final = books + '/' + name;

  if(!fs.existsSync(users)){fs.mkdirSync(users);}
  if(!fs.existsSync(books)){fs.mkdirSync(books);}
  fs.renameSync(file.path, final);

  return path.normalize(final);
}
