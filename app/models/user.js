'use strict';

module.exports = User;
var users = global.nss.db.collection('users');
var bcrypt = require('bcrypt');
var Mongo = require('mongodb');

function User(){
}

Object.defineProperty(User.prototype, 'valid', {
  get: function(){return !!this._id;}
});

User.create = function(obj, cb){
  var user = new User();
  user.email = obj.email;
  user.password = obj.password;

  if(parseInt(obj.code) !== getCode()){
    cb(user);
    return;
  }

  findByEmail(user.email, function(u){
    if(!u){
      hashPassword(user.password, function(ciphertext){
        user.password = ciphertext;
        insert(user, function(){
          cb(user);
        });
      });
    }else{
      cb(user);
    }
  });
};

User.findByEmailAndPassword = function(email, password, cb){
  findByEmail(email, function(user){
    if(user){
      compareHashes(password, user.password, function(isMatch){
        if(isMatch){
          cb(user);
        }else{
          cb(null);
        }
      });
    }else{
      cb(null);
    }
  });
};

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);

  users.findOne({_id:_id}, function(err, user){
    cb(user);
  });
};

function findByEmail(email, cb){
  users.findOne({email:email}, function(err, user){
    cb(user);
  });
}

function hashPassword(plaintext, cb){
  bcrypt.hash(plaintext, 10, function(err, ciphertext){
    cb(ciphertext);
  });
}

function insert(user, cb){
  users.insert(user, function(err, records){
    cb();
  });
}

function compareHashes(plaintext, ciphertext, cb){
  bcrypt.compare(plaintext, ciphertext, function(err, isMatch){
    cb(isMatch);
  });
}

function getCode(){
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  return day + month + year;
}
