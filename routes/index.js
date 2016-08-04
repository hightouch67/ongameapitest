var express = require('express');
var router = express.Router();
var get = require('get-parameter-names');
var decamelize = require('decamelize');
var Steem = require('steem');

/*
router.get('/@:name/friends', function(req, res, next) {
  var name = req.name;
  steem.getFollowing(name, 0, 10, function(err, result) {
    if (result) {
      console.log('1');
      var count = result.length;
      var done = 0;
      var content = [];
      for (var i = 0; i < count; i++) {
        steem.getState('@' + result[i].following + '/posts', function(e, data) {
          if (data.content) {
            console.log(data);
          }
          if (done == count) {
            //res.json(content);
          }
        });
      }
    }
  });
});
*/

router.get('/:method', function(req, res, next) {
  steem = new Steem();
  var query = req.query;
  var options = get(steem[req.params.method]);
  var params = [];
  options.forEach(function(option) {
    if (query[option]) {
      params.push(query[option]);
    }
  });
  var method = decamelize(req.params.method, '_');
  var data = {
    method: method,
    params: params
  };
  steem.send('database_api', data, function(err, result) {
    result = query.scope? result[query.scope] : result;
    res.json(result);
  });
});


module.exports = router;