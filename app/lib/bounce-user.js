'use strict';

var url = require('url');

module.exports = function(req, res, next){
  var path = url.parse(req.url).pathname;
  var isSecureUrl = /^\/books/.test(path);
  var isUser = !!res.locals.user;

  if(isSecureUrl){
    if(isUser){
      next();
    }else{
      res.redirect('/');
    }
  }else{
    next();
  }
};
