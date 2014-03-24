'use strict';

module.exports    = Book;
var books         = global.nss.db.collection('books');
var _             = require('lodash');
var fs            = require('fs');
var path          = require('path');
var Mongo         = require('mongodb');
var streamBuffers = require('stream-buffers');
var resize        = require('resize');

function Book(){
}

Book.create = function(bobj, fobj, userId, cb){
  var book = new Book();

  book._id = Mongo.ObjectID();
  book.userId = Mongo.ObjectID(userId);
  trimString(bobj);

  book.title = bobj.title;
  book.summary = bobj.summary;
  book.publisher = bobj.publisher;
  book.released = bobj.released;
  book.edition = bobj.edition;
  book.isbn10 = bobj.isbn10;
  book.isbn13 = bobj.isbn13;

  book.tags = splitString(bobj.tags);
  book.authors = splitString(bobj.authors);

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

Book.getStream = function(obj, userId, cb){
  var filename = __dirname + '/../files/' + userId + '/' + obj.bookId + '/' + obj.filename;
  var isCover = /cover/.test(obj.filename);

  if(isCover){
    resize(filename, 300, 300, {}, function(err, buf){
      var bufStream = new streamBuffers.ReadableStreamBuffer({frequency: 10, chunkSize: 65536});
      bufStream.put(buf);
      cb(bufStream);
    });
  }else{
    var fileStream = fs.createReadStream(filename);
    cb(fileStream);
  }
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

function trimString(obj){
  for(var property in obj){
    obj[property] = obj[property].trim();
  }
}

function splitString(string){
  var array = string.split(',').map(function(s){return s.trim();});
  return _.compact(array);
}
