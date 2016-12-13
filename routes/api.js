const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
const steem = require('steem');
const methods = require('../node_modules/steem/lib/methods.json');
const router = express.Router();

router.get('/', (req, res) => {
  res.send();
});

router.post('/rpc', (req, res) => {
  const { method, params, id } = req.body;
  const mapping = _.filter(methods, { method: method });
  steem.api.send(mapping[0].api, {
    method: method,
    params: params,
  }, (err, result) => {
    res.send({
      jsonrpc: '2.0',
      id,
      method,
      result,
    });
  });
});

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
    const json = query.scope
      ? result[query.scope] : result;
    res.json(json);
  });
});

module.exports = router;
