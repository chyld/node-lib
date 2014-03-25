'use strict';

module.exports    = Book;
var books         = global.nss.db.collection('books');
var _             = require('lodash');
var fs            = require('fs');
var path          = require('path');
var Mongo         = require('mongodb');
var resize        = require('resize');

function Book(){
}

Book.create = function(bobj, fobj, userId, cb){
  var book = new Book();
  book._id = Mongo.ObjectID();
  book.userId = Mongo.ObjectID(userId);
  makeBook(bobj, book);
  parseFile(book, fobj.file, 'data', userId, book._id.toString());
  parseFile(book, fobj.cover, 'cover', userId, book._id.toString());
  save(book, function(){
    cb();
  });
};

Book.update = function(obj, book, cb){
  makeBook(obj, book);
  save(book, function(){
    cb();
  });
};

Book.findAllByUserId = function(userId, cb){
  userId = Mongo.ObjectID(userId);

  books.find({userId:userId}).toArray(function(err, records){
    cb(records);
  });
};

Book.findAllByUserIdAndQuery = function(userId, query, cb){
  userId = Mongo.ObjectID(userId);

  books.find({userId:userId, tags:query.tag}).toArray(function(err, records){
    cb(records);
  });
};

Book.findByUserIdAndBookId = function(userId, bookId, cb){
  userId = Mongo.ObjectID(userId);
  bookId = Mongo.ObjectID(bookId);

  books.findOne({_id:bookId, userId:userId}, function(err, record){
    cb(record);
  });
};

Book.getStream = function(obj, userId, cb){
  var filename = __dirname + '/../files/' + userId + '/' + obj.bookId + '/' + obj.filename;
  var isCover = /cover/.test(obj.filename);

  if(isCover){
    getThumbnail(filename, function(thumbnail){
      cb(fs.createReadStream(thumbnail));
    });
  }else{
    cb(fs.createReadStream(filename));
  }
};

function makeBook(obj, book){
  trimString(obj);

  book.title = obj.title;
  book.summary = obj.summary;
  book.publisher = obj.publisher;
  book.released = obj.released;
  book.edition = obj.edition;
  book.isbn10 = obj.isbn10;
  book.isbn13 = obj.isbn13;

  book.tags = splitString(obj.tags);
  book.authors = splitString(obj.authors);
}

function save(book, cb){
  books.save(book, function(err, count){
    cb();
  });
}

function getThumbnail(filename, cb){
  var dir = path.dirname(filename);
  var ext = path.extname(filename);
  var thumb = dir + '/thumb' + ext;

  if(fs.existsSync(thumb)){
    cb(thumb);
  }else{
    resize(filename, 300, 300, {}, function(err, buf){
      fs.writeFile(thumb, buf, function (err) {
        cb(thumb);
      });
    });
  }
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
