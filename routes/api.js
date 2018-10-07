const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
var mysql = require('mysql');
const router = express.Router();
const sql = require('mssql')
const steem = require('steem');

steem.api.setOptions({ url: 'https://api.steemit.com' });


router.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

// CONTACTS API ROUTES BELOW
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
}

var pool1 = mysql.createPool({
  connectionLimit: 5,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});


router.get("/api/user/:name/:permlink", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT * FROM projects where author='${req.params.name}' AND permlink='${req.params.permlink}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/fullprojects", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT * FROM projects`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/projects", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, permlink, title, json_metadata, type FROM projects`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/addaproject/:name/:permlink", function (req, res) {
  steem.api.getContent(req.params.name, req.params.permlink, function (err, result) {
    try {
      result.json_metadata = JSON.parse(result.json_metadata);
    } catch (e) {
      console.log(e)
    }
    var query = `INSERT INTO projects (author,permlink,json_metadata) 
                            VALUES
                                  ('${result.author}',
                                  '${result.permlink}','${result.json_metadata}')`
    pool1.getConnection(function (error, connection) {
      connection.query(query, function (err, result) {
        if (err) return;
        else
          res.json(result)
        connection.release();
      })
    })
  });
})


router.get("/api/characters", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM user"
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/gifts/:name", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM gift WHERE username='" + req.params.name + "'"
    connection.query(query, function (err, result) {
      if (err) return (err);
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/character/:name", function (req, res) {
  var playerid;
  var character = {}
  pool1.getConnection(function (err, connection) {
    //LOAD USER
    var query = "SELECT * FROM user WHERE username='" + req.params.name + "'"
    connection.query(query, function (err, result) {
      if (err || result.length < 1) return res.json(err);
      playerid = result[0].user_id
      character = result[0]
      //LOAD CHARACTER
      var query = "SELECT * FROM characters WHERE character_id='" + playerid + "'"
      connection.query(query, function (err, result) {
        if (err) return;
        character.character = result[0]
        //LOAD ATTRIBUTES
        var query = "SELECT * FROM character_attribute WHERE character_id='" + playerid + "'"
        connection.query(query, function (err, result) {
          if (err) return;
          character.character.attributes = result
          //LOAD ITEMS
          var query = "SELECT * FROM character_item WHERE character_id='" + playerid + "'"
          connection.query(query, function (err, result) {
            if (err) return;
            character.character.items = result
            //LOAD EQUIPMENT
            var query = "SELECT * FROM character_equipment WHERE character_id='" + playerid + "'"
            connection.query(query, function (err, result) {
              if (err) return;
              character.character.equipment = result
              //LOAD CLASS
              var query = "SELECT * FROM character_class WHERE character_id='" + playerid + "'"
              connection.query(query, function (err, result) {
                if (err) return;
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
  pool1.getConnection(function (err, connection) {
    //LOAD ATTRIBUTES
    var query = "SELECT * FROM attribute"
    connection.query(query, function (err, result) {
      if (err) return;
      properties.attributes = result
      //LOAD ITEMS
      var query = "SELECT * FROM item"
      connection.query(query, function (err, result) {
        if (err) return;
        properties.items = result
        //LOAD ITEMS ATTRIBUTES
        var query = "SELECT * FROM item_attribute"
        connection.query(query, function (err, result) {
          if (err) return;
          properties.items_attributes = result
          //LOAD ITEMS TYPES
          var query = "SELECT * FROM item_type"
          connection.query(query, function (err, result) {
            if (err) return;
            properties.items_types = result
            //LOAD SLOTS
            var query = "SELECT * FROM equipment_slot"
            connection.query(query, function (err, result) {
              if (err) return;
              properties.slots = result
            })
            //LOAD CLASS
            var query = "SELECT * FROM class"
            connection.query(query, function (err, result) {
              if (err) return;
              properties.class = result
              //LOAD SHOP
              var query = "SELECT * FROM shop"
              connection.query(query, function (err, result) {
                if (err) return;
                properties.shop = result
                res.json(properties)
                connection.release();
              })
            })
          })
        })
      })
    })
  })
});

router.get("/api/battle", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM battle"
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/battle_history", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM battle_history"
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})


function getHash(input) {
  var hash = 0, len = input.length;
  for (var i = 0; i < len; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return hash;

}

module.exports = router;
