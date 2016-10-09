var express = require('express');
var router = express.Router();
var get = require('get-parameter-names');
var decamelize = require('decamelize');
var _ = require('lodash');
var Steem = require('steem');


router.get('/:method', function(req, res, next) {
  var query = req.query;
  var ws = (query.ws)? query.ws : 'wss://steemit.com/wspa';
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
  var api = 'database_api';
  if (req.params.method == 'getFollowers' || req.params.method == 'getFollowing') {
    api = 'follow_api';
  } elseif (req.params.method == 'broadcastTransaction' || req.params.method == 'broadcastTransactionWithCallback') {
    api = 'network_broadcast_api';
  } elseif (req.params.method == 'login') {
    api = 'login_api';
  }
  steem.send(api, data, function(err, result) {
    var json = _.has(result, 'result')? query.scope? result.result[query.scope] : result.result : {};
    res.json(json);
  });
});


module.exports = router;
