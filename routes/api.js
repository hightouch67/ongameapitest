const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
var mysql = require('mysql');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ hello: 'world' });
});


// CONTACTS API ROUTES BELOW
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
}

router.get("/api/characters", function (req, res) {
  var element = {} ,characters = []
  var query = "SELECT * FROM user"
  Connect(query,element,function(error){
    if(error)
    res.json(error)
  })
});

router.get("/api/character/:id", function (req, res) {
  console.log(req.params.id)
  res.json({ test: 'contactsss' });
});


Connect = function (query,object, cb) {
  var con = mysql.createConnection({
    host: "db4free.net",
    user: "ongame",
    password: "Abcdef55",
    database: "ongame"
  })
    var element = {} ,characters = []
  con.connect(function (err) {
    if (err) throw err;
    // var json = '{"skin": "none","hr_weapon": "none","hl_weapon": "none", "body": "none","bottom": "none","hat": "none"}'
    // var id = getHash('hightouch')
    // username = "hightouch"
    // //var query = "INSERT INTO users (id, name, level, xp, inventory) VALUES ('"+id +"," +username +"','"+json+"') ON DUPLICATE KEY UPDATE id = id + 1"
    // var query = "SELECT * FROM user"
    // console.log("Connected!");
    // var sql = "INSERT INTO users (name, inventory) VALUES ('hightouch','[name1]')";

    con.query(query, function (err, result) {
      if (err) return cb(null);
      for (var i = 0; i < result.length; i++) {
        element = result[i]
        var id = element.name
        characters.push(element)
      }
      return cb(characters)
    })
  })

}
function getHash(input) {
  var hash = 0, len = input.length;
  for (var i = 0; i < len; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0; // to 32bit integer
  }
  return hash;
}

module.exports = router;
