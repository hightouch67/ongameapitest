var express = require('express');
var router = express.Router();
var Steem = require('steem');
var _ = require('lodash');

router.get('/@:name/friends', function(req, res, next) {
  var steem = new Steem();
  var name = req.params.name;
  steem.getFollowing(name, 0, 10, function(err, result) {
    if (!err) {
     var count = result.length;
     var done = 0;
     var content = [];
     for (var i = 0; i < count; i++) {
       steem.getState('@' + result[i].following, function(e, data) {
         for (var post in data.content) {
           content.push(data.content[post]);
         }
         done++;
         if (done == count) {
           res.render('front/friends', {layout: 'front', posts: _.sortBy(content, 'created').reverse()});
         }
       });
     }
    }
  });
});


module.exports = router;