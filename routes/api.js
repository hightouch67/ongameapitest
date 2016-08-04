var express = require('express');
var router = express.Router();
var get = require('get-parameter-names');
var decamelize = require('decamelize');
var Steem = require('steem');

router.get('/:method', function(req, res, next) {
  var steem = new Steem();
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
    var json = query.scope? result.result[query.scope] : result.result;
    res.json(json);
  });
});


module.exports = router;