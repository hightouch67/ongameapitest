var express = require('express');
var router = express.Router();
var Steem = require('steem');

router.get('/@:name/friends', function(req, res, next) {
  var steem = new Steem();
  var name = req.params.name;
  steem.getFollowing(name, 0, 10, function(err, result) {
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
           res.render('front/friends', {posts: content});
         }
       });
     }
  });
});


module.exports = router;