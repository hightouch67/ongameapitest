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
  var element = {}, characters = []
  var query = "SELECT * FROM user"
  Connect(query, element, function (result) {
    if (result)
      res.json(result)
  })
});

router.get("/api/character/:name", function (req, res) {
  var playerid;
  var character = {}
  //LOAD CHARACTER
  var query = "SELECT * FROM user WHERE first_name='" + req.params.name + "'"
  Connect(query, function (result) {
    if (result)
      playerid = result[0].user_id
    character.character = result[0]
    //LOAD EQUIPMENT
    var query = "SELECT * FROM characters WHERE character_id='" + playerid + "'"
    Connect(query, function (result) {
      if (result)
        character.equipment = result[0]
      //LOAD ATTRIBUTES
      var query = "SELECT * FROM character_attribute WHERE character_id='" + playerid + "'"
      Connect(query, function (result) {
        if (result)
          character.attributes = result
        //LOAD ITEMS
        var query = "SELECT * FROM character_item WHERE character_id='" + playerid + "'"
        Connect(query, function (result) {
          if (result)
            character.items = result
          res.json(character)
        })
      })
    })
  })
});

router.get("/api/properties", function (req, res) {
  var properties = {}
  //LOAD ATTRIBUTES
  var query = "SELECT * FROM attribute"
  Connect(query, function (result) {
    if (result)
      properties.attributes = result
    //LOAD ITEMS
    var query = "SELECT * FROM item"
    Connect(query, function (result) {
      if (result)
        properties.items = result
      //LOAD ITEMS ATTRIBUTES
      var query = "SELECT * FROM item_attribute"
      Connect(query, function (result) {
        if (result)
          properties.items_attributes = result
        //LOAD ITEMS TYPES
        var query = "SELECT * FROM item_type"
        Connect(query, function (result) {
          if (result)
            properties.items_types = result
          //LOAD SLOTS
          var query = "SELECT * FROM equipment_slot"
          Connect(query, function (result) {
            if (result)
              properties.slots = result
            res.json(properties)
          })
        })
      })
    })
  })
});
// Connect = function (query, object, cb) {
//   var con = mysql.createConnection({
//     host: "db4free.net",
//     user: "ongame",
//     password: "Abcdef55",
//     database: "ongame"
//   })
//   var element = {}, characters = []
//   con.connect(function (err) {
//     if (err) throw err;
//     con.query(query, function (err, result) {
//       if (err) return cb(null);
//       for (var i = 0; i < result.length; i++) {
//         element = result[i]
//         characters.push(element)
//       }
//       return cb(characters)
//     })
//   })

// }

var connection = mysql.createConnection({
  host: 'db4free.net',
  user: 'ongame',
  password: 'Abcdef55',
  database: 'ongame'
});

connection.connect();


Connect = function (query, cb) {
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    else {
      return cb(results)
    }
  });

}





function getHash(input) {
  var hash = 0, len = input.length;
  for (var i = 0; i < len; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return hash;
  connection.end();
}

module.exports = router;
