var express = require('express');
var router = express.Router();
var get = require('get-parameter-names');
var decamelize = require('decamelize');
var _ = require('lodash');
var Steem = require('steem');


router.get('/getFollowingPosts', function(req, res, next) {
  var follower = req.query.follower;
  var steem = new Steem();
  steem.getFollowing(follower, 0, 100, function(err, result) {
    if (err) {
      res.json(err);
    } else {
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
            var posts = _.sortBy(content, 'created').reverse().slice(0, 20);
            res.json(posts);
          }
        });
      }
    }
  });
});

router.get('/:method', function(req, res, next) {
  var query = req.query;
  var ws = (query.ws)? query.ws : '';
  delete query.ws;
  var steem = new Steem(ws);
  var options = get(steem[req.params.method]);
  var params = [];
  options.forEach(function(option) {
    if (query[option]) {
      params.push(query[option]);
    }
  });
  var method = decamelize(req.params.method, '_');
  var data = {
    method: method,//
    params: params
  };
  steem.send('database_api', data, function(err, result) {
    var json = _.has(result, 'result')? query.scope? result.result[query.scope] : result.result : {};
    res.json(json);
  });
});


module.exports = router;