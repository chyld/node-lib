'use strict';

module.exports = function(req, res, next){
  var User = require('../models/user');

  if(req.session.userId){
    User.findById(req.session.userId, function(user){
      res.locals.user = user;
      next();
    });
  }else{
    next();
  }
};
