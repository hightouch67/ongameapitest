const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
var mysql = require('mysql');
const router = express.Router();
const sql = require('mssql')
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
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

const config = {
  host: process.env.SQL_HOST,
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB,
  pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
  }
}



router.get("/api/user/:name", function (req, res) {
  var array = []
  sql.connect(config, err => {
    // ... error checks
  
    const request = new sql.Request()
    request.stream = true // You can set streaming differently for each request
    request.query(`select * from Comments where author = ${req.params.name}`) // or request.execute(procedure)
  
    request.on('recordset', columns => {
        console.log(columns)
        // Emitted once for each recordset in a query
    })
  
    request.on('row', row => {
        console.log(row)
        array.push(row)
        // Emitted for each row in a recordset
    })
  
    request.on('error', err => {
        // May be emitted multiple times
        sql.close();
    })
  
    request.on('done', result => {
        // Always emitted as the last one
        console.log(result)
        res.json(array)
        sql.close();
    })
  })
  
  sql.on('error', err => {
    // ... error handler
    sql.close();
  })
})


router.get("/api/characters", function (req, res) {
  pool.getConnection(function (error, connection) {
    var query = "SELECT * FROM user"
    connection.query(query, function (err, result) {
      if (err) return ;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/gifts/:name", function (req, res) {
  pool.getConnection(function (error, connection) {
    var query = "SELECT * FROM gift WHERE username='" + req.params.name + "'"
    connection.query(query, function (err, result) {
      if (err) return (err) ;
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
      if (err || result.length < 1) return res.json(err);
      playerid = result[0].user_id
      character = result[0]
      //LOAD CHARACTER
      var query = "SELECT * FROM characters WHERE character_id='" + playerid + "'"
      connection.query(query, function (err, result) {
        if (err) return ;
        character.character = result[0]
        //LOAD ATTRIBUTES
        var query = "SELECT * FROM character_attribute WHERE character_id='" + playerid + "'"
        connection.query(query, function (err, result) {
          if (err) return ;
          character.character.attributes = result
          //LOAD ITEMS
          var query = "SELECT * FROM character_item WHERE character_id='" + playerid + "'"
          connection.query(query, function (err, result) {
            if (err) return ;
            character.character.items = result
            //LOAD EQUIPMENT
            var query = "SELECT * FROM character_equipment WHERE character_id='" + playerid + "'"
            connection.query(query, function (err, result) {
              if (err) return ;
              character.character.equipment = result
              //LOAD CLASS
              var query = "SELECT * FROM character_class WHERE character_id='" + playerid + "'"
              connection.query(query, function (err, result) {
                if (err) return ;
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
  pool.getConnection(function (err, connection) {
    //LOAD ATTRIBUTES
    var query = "SELECT * FROM attribute"
    connection.query(query, function (err, result) {
      if (err) return ;
      properties.attributes = result
      //LOAD ITEMS
      var query = "SELECT * FROM item"
      connection.query(query, function (err, result) {
        if (err) return ;
        properties.items = result
        //LOAD ITEMS ATTRIBUTES
        var query = "SELECT * FROM item_attribute"
        connection.query(query, function (err, result) {
          if (err) return ;
          properties.items_attributes = result
          //LOAD ITEMS TYPES
          var query = "SELECT * FROM item_type"
          connection.query(query, function (err, result) {
            if (err) return ;
            properties.items_types = result
            //LOAD SLOTS
            var query = "SELECT * FROM equipment_slot"
            connection.query(query, function (err, result) {
              if (err) return ;
              properties.slots = result
            })
            //LOAD CLASS
            var query = "SELECT * FROM class"
            connection.query(query, function (err, result) {
              if (err) return ;
              properties.class = result
              //LOAD SHOP
              var query = "SELECT * FROM shop"
              connection.query(query, function (err, result) {
                if (err) return ;
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
  pool.getConnection(function (error, connection) {
    var query = "SELECT * FROM battle"
    connection.query(query, function (err, result) {
      if (err) return ;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/battle_history", function (req, res) {
  pool.getConnection(function (error, connection) {
    var query = "SELECT * FROM battle_history"
    connection.query(query, function (err, result) {
      if (err) return ;
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
