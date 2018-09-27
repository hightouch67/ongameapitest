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

var pool = mysql.createPool({
  connectionLimit: 5,
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "bce50ec26bedce",
  password: "13c7ceb6",
  database: "heroku_38540d920d933f3"
});


router.get("/api/characters", function (req, res) {
  pool.getConnection(function (error, connection) {
    var query = "SELECT * FROM user"
    connection.query(query, function (err, result) {
      if (err) throw err;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/character/:name", function (req, res) {
  var playerid;
  var character = {}
  pool.getConnection(function (err, connection) {
    //LOAD USER
    var query = "SELECT * FROM user WHERE username='" + req.params.name + "'"
    connection.query(query, function (err, result) {
            if (err) throw err;
        playerid = result[0].user_id
      character = result[0]
      //LOAD CHARACTER
      var query = "SELECT * FROM characters WHERE character_id='" + playerid + "'"
      connection.query(query, function (err, result) {
              if (err) throw err;
          character.character = result[0]
        //LOAD ATTRIBUTES
        var query = "SELECT * FROM character_attribute WHERE character_id='" + playerid + "'"
        connection.query(query, function (err, result) {
                if (err) throw err;
            character.character.attributes = result
          //LOAD ITEMS
          var query = "SELECT * FROM character_item WHERE character_id='" + playerid + "'"
          connection.query(query, function (err, result) {
                  if (err) throw err;
              character.character.items = result
            //LOAD EQUIPMENT
            var query = "SELECT * FROM character_item WHERE character_id='" + playerid + "'"
            connection.query(query, function (err, result) {
                    if (err) throw err;
                character.character.equipment = result
              //LOAD CLASS
              var query = "SELECT * FROM character_class WHERE character_id='" + playerid + "'"
              connection.query(query, function (err, result) {
                      if (err) throw err;
                  character.character.class = result[0]
                res.json(character)
                connection.release();
              })
            })
          })
        })
      })
    })
  })
})
router.get("/api/properties", function (req, res) {
  var properties = {}
  //LOAD ATTRIBUTES
  var query = "SELECT * FROM attribute"
  connection.query(query, function (err, result) {
    if (err) throw err;
      properties.attributes = result
    //LOAD ITEMS
    var query = "SELECT * FROM item"
    connection.query(query, function (err, result) {
      if (err) throw err;
        properties.items = result
      //LOAD ITEMS ATTRIBUTES
      var query = "SELECT * FROM item_attribute"
      connection.query(query, function (err, result) {
        if (err) throw err;
          properties.items_attributes = result
        //LOAD ITEMS TYPES
        var query = "SELECT * FROM item_type"
        connection.query(query, function (err, result) {
          if (err) throw err;
            properties.items_types = result
          //LOAD SLOTS
          var query = "SELECT * FROM equipment_slot"
          connection.query(query, function (err, result) {
            if (err) throw err;
              properties.slots = result
          })
          //LOAD CLASS
          var query = "SELECT * FROM class"
          connection.query(query, function (err, result) {
            if (err) throw err;
              properties.class = result
            res.json(properties)
            connection.release();
          })
        })
      })
    })
  })
});


function getHash(input) {
  var hash = 0, len = input.length;
  for (var i = 0; i < len; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return hash;

}

module.exports = router;
