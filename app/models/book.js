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

Book.shelf = function(book, cb){
  book.shelf = (book.shelf && book.shelf === 't') ? 'f' : 't';

  save(book, function(){
    cb();
  });
};

Book.find = function(userId, bookId, cb){
  userId = Mongo.ObjectID(userId);
  bookId = Mongo.ObjectID(bookId);

  books.findOne({_id:bookId, userId:userId}, function(err, record){
    cb(record);
  });
};

Book.query = function(userId, query, cb){
  userId = Mongo.ObjectID(userId);
  query.userId = userId;

  books.find(query).sort({'released': -1, 'title': 1}).toArray(function(err, records){
    cb(records);
  });
};

Book.getStream = function(book, name, cb){
  var filename = __dirname + '/../files/' + book.userId + '/' + book._id + '/' + name;
  var isCover = /cover/.test(filename);

  if(isCover){
    getThumbnail(book, filename, function(thumbnail, type, length){
      cb(fs.createReadStream(thumbnail), type, length);
    });
  }else{
    cb(fs.createReadStream(filename), book.data[1], book.data[2]);
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

function getThumbnail(book, filename, cb){
  var dir = path.dirname(filename);
  var ext = path.extname(filename);
  var thumb = dir + '/thumb' + ext;

  if(fs.existsSync(thumb)){
    cb(thumb, book.thumb[1], book.thumb[2]);
  }else{
    resize(filename, 300, 300, {}, function(err, buf){
      fs.writeFile(thumb, buf, function (err) {
        book.thumb = [];
        book.thumb[0] = '/books/stream/' + book._id + '/thumb' + ext;
        book.thumb[1] = book.cover[1];
        book.thumb[2] = buf.length;
        save(book, function(){
          cb(thumb, book.thumb[1], book.thumb[2]);
        });
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
