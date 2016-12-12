const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
const steem = require('steem');
const methods = require('../node_modules/steem/lib/methods.json');
const router = express.Router();

router.get('/:method', (req, res) => {
  const query = req.query;
  const method = decamelize(req.params.method, '_');
  const mapping = _.filter(methods, { method: method });
  let params = [];
  if (mapping[0].params) {
    mapping[0].params.forEach((param) => {
      const queryParam = query[param] || query[decamelize(param)];
      params.push(queryParam);
    });
  }
  steem.api.send(mapping[0].api, {
    method: method,
    params: params
  }, (err, result) => {
    res.json(result);
  });
});

module.exports = router;
