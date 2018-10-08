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


loadSingle = function (author, permlink, cb) {
  steem.api.getContent(author, permlink, function (error, result) {
    if (result) {
      result = parseProject(result)
      // result.rewards = JSON.stringify(result.json_metadata.rewards)
      // result.goals = JSON.stringify(result.json_metadata.goals)
      // result.image = setImage(result.json_metadata.basics.description)
      cb(result)
    }
    else {
      cb(null)
    }
  })
}

router.get("/api/addaproject/:name/:permlink", function (req, res) {
  loadSingle(req.params.name, req.params.permlink, function (post) {
    if (post) {
      var query = `INSERT INTO projects (author,permlink,category,parent_author, parent_permlink, title, body, last_update, created, active, last_payout, depth, children, net_rshares, abs_rshares, vote_rshares, children_abs_rshares, cashout_time, max_cashout_time, total_vote_weight, reward_weight, total_payout_value,curator_payout_value, author_rewards, net_votes, root_comment, mode, max_accepted_payout,percent_steem_dollars, allow_replies, allow_votes, allow_curation_rewards, beneficiaries,url, root_title, pending_payout_value, total_pending_payout_value, active_votes,replies, author_reputation, promoted, body_length, reblogged_by, body_language, image, rewards, goals, thanks_message, description, socials, tags, project ) 
      VALUES
          ('${post.author}','${post.permlink}','${post.category}','${post.parent_author}','${post.parent_permlink}',
          '${post.title}','${post.body}','${post.last_update}','${post.created}','${post.active}','${post.last_payout}',
          '${post.depth}','${post.children}','${post.net_rshares}','${post.abs_rshares}','${post.vote_rshares}','${post.children_abs_rshares}',
          '${post.cashout_time}','${post.max_cashout_time}','${post.total_vote_weight}','${post.reward_weight}','${post.total_payout_value}',
          '${post.curator_payout_value}','${post.author_rewards}','${post.net_votes}','${post.root_comment}','${post.mode}','${post.max_accepted_payout}',
          '${post.percent_steem_dollars}','${post.allow_replies}','${post.allow_votes}','${post.allow_curation_rewards}','${post.beneficiaries}',
          '${post.url}','${post.root_title}','${post.pending_payout_value}','${post.total_pending_payout_value}','${post.active_votes}',
          '${post.replies}','${post.author_reputation}','${post.promoted}','${post.body_length}','${post.reblogged_by}','${post.body_language}',
          '${post.image}','${post.rewards}','${post.goals}','${post.thanks}','${post.description}',
          '${post.socials}','${post.tags}','${post.project}')`
      pool1.getConnection(function (error, connection) {
        connection.query(query, function (err, result) {
          if (err) {

            res.json(err);
            connection.release();
          }
          else
          res.json(result)
        })
      })
    }
  })
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


setImage = function (string) {
  if (!string) return
    var pattern = "(http(s?):)([/|.|\\w|\\s])*." + "(?:jpe?g|gif|png|JPG)";
    var res = string.match(pattern);
    if (res) {
      if (res[0]) {
        //return res[0]
        if (res[0].includes('hightouch')) {
          var filename = res[0].split("/").pop();
          if (filename) {
            return "https://res.cloudinary.com/hightouch/image/upload/c_fill,h_200,w_235/v1523828169/" + filename
          }
        }
        else {
          return res[0]
        }
      }
    }
    else {
      pattern = "(http(s?):\/\/.*\.(?:jpe?g|gif|png|JPG))";
      res = string.match(pattern);
      if (res) {
        return res[0]
      }
      else {
        return "./images/notfound.jpg"
      }
    }
}


function parseProject(project) {
  var newProject = {}
  try {
    newProject.json_metadata = JSON.parse(project.json_metadata)
    } catch(e) {
      console.log(e)
  }
  if (!newProject) newProject = {}
  newProject.author = project.author
  newProject.permlink = project.permlink
  newProject.category = project.category
  newProject.parent_author = project.parent_author
  newProject.parent_permlink = project.parent_permlink
  newProject.title = project.title
  newProject.body = project.body
  newProject.last_update = project.last_update
  newProject.created = project.created
  newProject.active = project.active
  newProject.last_payout = project.last_payout


  newProject.depth = project.depth
  newProject.children = project.children
  newProject.net_rshares = project.net_rshares
  newProject.abs_rshares = project.abs_rshares
  newProject.vote_rshares = project.vote_rshares
  newProject.children_abs_rshares = project.children_abs_rshares
  newProject.cashout_time = project.cashout_time
  newProject.max_cashout_time = project.max_cashout_time
  newProject.total_vote_weight = project.total_vote_weight
  newProject.reward_weight = project.reward_weight
  newProject.total_payout_value = project.total_payout_value
  newProject.curator_payout_value = project.curator_payout_value

  newProject.author_rewards = project.author_rewards
  newProject.net_votes = project.net_votes
  newProject.root_comment = project.root_comment
  newProject.max_accepted_payout = project.max_accepted_payout
  newProject.percent_steem_dollars = project.percent_steem_dollars
  newProject.allow_replies = project.allow_replies
  newProject.allow_votes = project.allow_votes
  newProject.allow_curation_rewards = project.allow_curation_rewards
  newProject.beneficiaries = project.beneficiaries
  newProject.url = project.url
  newProject.root_title = project.root_title
  newProject.pending_payout_value = project.pending_payout_value
  newProject.total_pending_payout_value = project.total_pending_payout_value
  newProject.active_votes = project.active_votes
  newProject.replies = project.replies
  newProject.author_reputation = project.author_reputation
  newProject.promoted = project.promoted
  newProject.body_length = project.body_length
  newProject.reblogged_by = project.reblogged_by
  newProject.body_language = project.body_language
  newProject.description = newProject.json_metadata.basics.description
  newProject.image = setImage(newProject.description)
  newProject.rewards = newProject.json_metadata.rewards
  newProject.goals = newProject.json_metadata.goals
  newProject.thanks = newProject.json_metadata.thanks.message
  newProject.socials = newProject.json_metadata.basics.socials
  newProject.tags = newProject.json_metadata.tags
  newProject.project = newProject.json_metadata.project
  return newProject;
}

module.exports = router;