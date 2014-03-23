'use strict';

var User = require('../models/user');

exports.new = function(req, res){
  res.render('users/new', {title: 'Register'});
};

exports.create = function(req, res){
  User.create(req.body, function(user){
    if(user.valid){
      res.redirect('/');
    }else{
      res.redirect('/users/new');
    }
  });
};

exports.login = function(req, res){
  res.render('users/login', {title: 'Login'});
};

exports.authenticate = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id;
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      req.session.destroy(function(){
        res.redirect('/login');
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};
