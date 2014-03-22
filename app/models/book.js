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

  parseFile(book, fobj.file, 'data', userId, book._id.toString());
  parseFile(book, fobj.cover, 'cover', userId, book._id.toString());

  insert(book, function(){
    cb();
  });
};

Book.findAll = function(userId, cb){
  userId = Mongo.ObjectID(userId);

  books.find({userId:userId}).toArray(function(err, records){
    cb(records);
  });
};

Book.getPath = function(obj, userId){
  return __dirname + '/../files/' + userId + '/' + obj.bookId + '/' + obj.filename;
};

function insert(book, cb){
  books.insert(book, function(err, records){
    cb();
  });
}

function parseFile(book, file, name, userId, bookId){
  var extension = path.extname(file.name);
  var files = __dirname + '/../files';
  var users = files + '/' + userId;
  var books = users + '/' + bookId;
  var final = books + '/' + name + extension;
  var route = '/books/stream/'  + bookId + '/' + name + extension;

  if(!fs.existsSync(users)){fs.mkdirSync(users);}
  if(!fs.existsSync(books)){fs.mkdirSync(books);}
  fs.renameSync(file.path, final);

  book[name] =  [route, file.type, file.size];
}
