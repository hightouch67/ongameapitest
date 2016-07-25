var express = require('express');
var router = express.Router();
var Steem = require('steem'),
  steem = new Steem();

router.get('/:method', function(req, res, next) {
  var params = req.query;
  steem[req.params.method](function(err, result) {
    res.json(result);
  });
});

module.exports = router;