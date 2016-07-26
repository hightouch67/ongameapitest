var express = require('express');
var router = express.Router();
var get = require('get-parameter-names');
var decamelize = require('decamelize');
var Steem = require('steem'),
  steem = new Steem();

router.get('/:method', function(req, res, next) {
  var query = req.query;
  var lenght = steem[req.params.method].length;
  var options = get(steem[req.params.method]);
  var callback = function(err, result) {
    res.json(result);
  };
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