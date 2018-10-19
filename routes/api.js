const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
var mysql = require('mysql');
const router = express.Router();
const sql = require('mssql')
const steem = require('steem');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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


router.get("/api/getproject/:name/:permlink", function (req, res) {
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

router.get("/api/getprojects", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, permlink, created, title, image, mode, tags, payout, type FROM projects`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getprojectspayout", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT permlink, payout FROM projects`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getupdatespayout", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT permlink, payout FROM updates`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})



router.get("/api/getfullprojects", function (req, res) {
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

router.get("/api/getdonations", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT * FROM donations`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getfullupdates", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, permlink, created, mode, project FROM updates`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getrecentupdates", function (req, res) {
  var date = new Date();
  date.setDate(date.getDate() - 7);
  var dd = date.getDate();
  var mm = date.getMonth() + 1; //January is 0!
  var yyyy = date.getFullYear();
  date = yyyy + '/' + mm + '/' + dd;
  if (dd < 10) {
    dd = '0' + dd
  }
  if (mm < 10) {
    mm = '0' + mm
  }
  date = yyyy + '/' + mm + '/' + dd;
  pool1.getConnection(function (error, connection) {
    var query = "SELECT author, permlink, created, mode, project FROM updates WHERE created > '" + date + "'"
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getuserupdates/:name/:permlink", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, permlink, body, created, title, project, payout, voters FROM updates where author='${req.params.name}' AND project='${req.params.permlink}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getprojectsdetails", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, description, permlink, created, title, image, tags, active_votes, socials, rewards, goals, beneficiaries, thanks_message, type FROM projects`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})


router.get("/api/updateproject/:name/:permlink", function (req, res) {
  loadSingle(req.params.name, req.params.permlink, function (post) {
    if (post) {
      var query = `UPDATE projects SET category='${post.category}', title='${post.title}', body='${post.body}', json_metadata='${post.json_metadata}', 
        last_payout='${post.last_payout}', 
        net_rshares='${post.net_rshares}', abs_rshares='${post.abs_rshares}', mode='l',
        vote_rshares='${post.vote_rshares}', children_abs_rshares='${post.children_abs_rshares}', 
        cashout_time='${post.cashout_time}', total_vote_weight='${post.total_vote_weight}', 
        reward_weight='${post.reward_weight}', total_payout_value='${post.total_payout_value}' ,curator_payout_value='${post.curator_payout_value}', 
        author_rewards='${post.author_rewards}', net_votes='${post.net_votes}', 
        root_comment='${post.root_comment}',root_title='${post.root_title}', pending_payout_value='${post.pending_payout_value}', total_pending_payout_value='${post.total_pending_payout_value}',
        active_votes='${post.active_votes}',replies='${post.replies}',
        body_length='${post.body_length}', reblogged_by='${post.reblogged_by}', 
        body_language='${post.body_language}', image='${post.image}', tags='${post.tags}',voters='${post.voters}', payout='${post.payout}' WHERE permlink='${req.params.permlink}'`
      pool1.getConnection(function (error, connection) {
        connection.query(query, function (err, result) {
          if (err) {
            console.log(err)
            res.json(err);
            connection.release();
          }
          else
            console.log('project inserted')
          res.json(result)
        })
      })
    }
    else {
      connection.release();
    }
  })
})

router.get("/api/updateupd/:name/:permlink", function (req, res) {
  loadSingle(req.params.name, req.params.permlink, function (post) {
    if (post) {
      var query = `UPDATE updates SET category='${post.category}', title='${post.title}', body='${post.body}', json_metadata='${post.json_metadata}', 
        last_payout='${post.last_payout}', 
        net_rshares='${post.net_rshares}', abs_rshares='${post.abs_rshares}', mode='l',
        vote_rshares='${post.vote_rshares}', children_abs_rshares='${post.children_abs_rshares}', 
        cashout_time='${post.cashout_time}', total_vote_weight='${post.total_vote_weight}', 
        reward_weight='${post.reward_weight}', total_payout_value='${post.total_payout_value}' ,curator_payout_value='${post.curator_payout_value}', 
        author_rewards='${post.author_rewards}', net_votes='${post.net_votes}', 
        root_comment='${post.root_comment}',root_title='${post.root_title}', pending_payout_value='${post.pending_payout_value}', total_pending_payout_value='${post.total_pending_payout_value}',
        active_votes='${post.active_votes}',replies='${post.replies}',
        body_length='${post.body_length}', reblogged_by='${post.reblogged_by}', 
        body_language='${post.body_language}', image='${post.image}', tags='${post.tags}',voters='${post.voters}', payout='${post.payout}' WHERE permlink='${req.params.permlink}'`
      pool1.getConnection(function (error, connection) {
        connection.query(query, function (err, result) {
          if (err) {
            console.log(err)
            res.json(err);
            connection.release();
          }
          else
            console.log('update inserted')
          res.json(result)
        })
      })
    }
    else {
      connection.release();
    }
  })
})

router.get("/api/adddonation/:id/:name/:project/:amount/:memo/:sent/", function (req, res) {
  var query = `INSERT INTO donations (id, name, project, amount, memo, sent_amount) VALUES ('${req.params.id}','${req.params.name}','${req.params.project}','${req.params.amount}','${req.params.memo}','${req.params.sent}')`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('donation inserted')
      res.json(result)
    })
  })
})


loadSingle = function (author, permlink, cb) {
  SBD()
  STEEM()
  steem.api.getContent(author, permlink, function (error, result) {
    if (result) {
      try {
        var test = {}
        test.json_metadata = JSON.parse(result.json_metadata)
      } catch (e) {
        console.log(e)
      }
      if (test.json_metadata.content === 'project')
        cb(parseProject(result))
      else {
        cb(parseUpdate(result))
      }
    }
    else {
      cb(null)
    }
  })
}

router.get("/api/addproject/:name/:permlink/:type", function (req, res) {
  loadSingle(req.params.name, req.params.permlink, function (post) {
    if (post) {
      var query = `INSERT INTO projects (author,permlink,category,parent_author, parent_permlink, 
                  title, body, json_metadata, last_update, created, active, last_payout, depth, 
                  children, net_rshares, abs_rshares, vote_rshares, children_abs_rshares, cashout_time, max_cashout_time, 
                  total_vote_weight, reward_weight, total_payout_value,curator_payout_value, author_rewards, net_votes, root_comment, 
                  mode, max_accepted_payout,percent_steem_dollars, allow_replies, allow_votes, allow_curation_rewards, beneficiaries,url, 
                  root_title, pending_payout_value, total_pending_payout_value, active_votes,replies, author_reputation, promoted, body_length, 
                  reblogged_by, body_language, image, rewards, goals, thanks_message, description, socials, tags, project, type ) 
      VALUES
          ('${post.author}','${post.permlink}','${post.category}','${post.parent_author}','${post.parent_permlink}',
          '${post.title}','${post.body}','${post.json_metadata}','${post.last_update}','${post.created}','${post.active}','${post.last_payout}',
          '${post.depth}','${post.children}','${post.net_rshares}','${post.abs_rshares}','${post.vote_rshares}','${post.children_abs_rshares}',
          '${post.cashout_time}','${post.max_cashout_time}','${post.total_vote_weight}','${post.reward_weight}','${post.total_payout_value}',
          '${post.curator_payout_value}','${post.author_rewards}','${post.net_votes}','${post.root_comment}','${post.mode}','${post.max_accepted_payout}',
          '${post.percent_steem_dollars}','${post.allow_replies}','${post.allow_votes}','${post.allow_curation_rewards}','${post.beneficiaries}',
          '${post.url}','${post.root_title}','${post.pending_payout_value}','${post.total_pending_payout_value}','${post.active_votes}',
          '${post.replies}','${post.author_reputation}','${post.promoted}','${post.body_length}','${post.reblogged_by}','${post.body_language}',
          '${post.image}','${post.rewards}','${post.goals}','${post.thanks}','${post.description}',
          '${post.socials}','${post.tags}','${post.project}','${req.params.type}')`
      pool1.getConnection(function (error, connection) {
        connection.query(query, function (err, result) {
          if (err) {
            console.log(err)
            res.json(err);
            connection.release();
          }
          else
            console.log('project inserted')
          res.json(result)
        })
      })
    }
  })
})

router.get("/api/addupdate/:name/:permlink", function (req, res) {
  loadSingle(req.params.name, req.params.permlink, function (post) {
    if (post) {
      var query = `INSERT INTO updates (author,permlink,category,parent_author, parent_permlink, title, body, json_metadata, 
        last_update, created, active, last_payout, depth, children, net_rshares, abs_rshares, vote_rshares, children_abs_rshares, 
        cashout_time, max_cashout_time, total_vote_weight, reward_weight, total_payout_value,curator_payout_value, author_rewards, net_votes, 
        root_comment, mode, max_accepted_payout,percent_steem_dollars, allow_replies, allow_votes, allow_curation_rewards, beneficiaries,url, 
        root_title, pending_payout_value, total_pending_payout_value, active_votes,replies, author_reputation, promoted, body_length, reblogged_by, 
        body_language, image, tags, project ) 
      VALUES
          ('${post.author}','${post.permlink}','${post.category}','${post.parent_author}','${post.parent_permlink}',
          '${post.title}','${post.body}','${post.json_metadata}','${post.last_update}','${post.created}','${post.active}','${post.last_payout}',
          '${post.depth}','${post.children}','${post.net_rshares}','${post.abs_rshares}','${post.vote_rshares}','${post.children_abs_rshares}',
          '${post.cashout_time}','${post.max_cashout_time}','${post.total_vote_weight}','${post.reward_weight}','${post.total_payout_value}',
          '${post.curator_payout_value}','${post.author_rewards}','${post.net_votes}','${post.root_comment}','${post.mode}','${post.max_accepted_payout}',
          '${post.percent_steem_dollars}','${post.allow_replies}','${post.allow_votes}','${post.allow_curation_rewards}','${post.beneficiaries}',
          '${post.url}','${post.root_title}','${post.pending_payout_value}','${post.total_pending_payout_value}','${post.active_votes}',
          '${post.replies}','${post.author_reputation}','${post.promoted}','${post.body_length}','${post.reblogged_by}','${post.body_language}',
          '${post.image}','${post.tags}','${post.project}')`
      pool1.getConnection(function (error, connection) {
        connection.query(query, function (err, result) {
          if (err) {
            console.log(err)
            res.json(err);
            connection.release();
          }
          else
            console.log('update inserted')
          res.json(result)
        })
      })
    }
    else {
      connection.release();
    }
  })
})

router.get("/api/projects/authors", function (req, res) {
  var query = `SELECT author, permlink FROM projects`
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


router.get("/api/link/:user/:type/:userid", function (req, res) {
  var query = `INSERT INTO ongamusers (username, ${req.params.type}) VALUES ('${req.params.user}','${req.params.userid}')`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('ongameuser inserted')
      res.json(result)
    })
  })
})

router.get("/api/link/:user", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM ongamusers WHERE username='" + req.params.user + "'"
    connection.query(query, function (err, result) {
      if (err) return (err);
      else
        res.json(result)
      connection.release();
    })
  })
})




function parseProject(project) {
  var newProject = {}
  try {
    newProject.json_metadata = JSON.parse(project.json_metadata)
  } catch (e) {
    console.log(e)
  }
  if (!newProject) newProject = {}
  newProject.author = project.author
  newProject.permlink = project.permlink
  newProject.category = project.category
  newProject.parent_author = project.parent_author
  newProject.parent_permlink = project.parent_permlink
  newProject.title = project.title.toString().replace(/\'/g, "''")
  newProject.body = project.body.toString().replace(/\'/g, "''")
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

  newProject.url = project.url
  newProject.root_title = project.root_title.toString().replace(/\'/g, "''")
  newProject.pending_payout_value = project.pending_payout_value
  newProject.total_pending_payout_value = project.total_pending_payout_value

  newProject.replies = project.replies
  newProject.author_reputation = project.author_reputation
  newProject.promoted = project.promoted
  newProject.body_length = project.body_length
  newProject.reblogged_by = project.reblogged_by
  newProject.body_language = project.body_language
  newProject.socials = newProject.json_metadata.basics.social.toString().replace(/\'/g, "''")
  newProject.tags = newProject.json_metadata.tags
  newProject.project = newProject.json_metadata.project
  newProject.voters = displayVoter(project.active_votes, 0)

  newProject.payout = displayPayout(project.pending_payout_value, project.total_payout_value, project.curator_payout_value)
  for (z = 0; z <  newProject.voters.length; z++) {
    newProject.voters[z].upvote = Number(parseFloat(payoutupvote(newProject.voters[z].rsharespercent, newProject.payout)).toFixed(3))
    if(newProject.voters[z].upvote > 0)
    {
      delete newProject.voters[z].weight
      delete newProject.voters[z].rshares
      delete newProject.voters[z].percent
      delete newProject.voters[z].rsharespercent
      delete newProject.voters[z].reputation
    }
    else{

       newProject.voters.splice([z],1)
    }
  }

  try {
    newProject.voters = JSON.stringify(newProject.voters)
    newProject.beneficiaries = JSON.stringify(project.beneficiaries)
    newProject.active_votes = JSON.stringify(project.active_votes)
    newProject.thanks = JSON.stringify(newProject.json_metadata.thanks.message).toString().replace(/\'/g, "''")
    newProject.description = JSON.stringify(newProject.json_metadata.basics.description).toString().replace(/\'/g, "''")
    newProject.image = setImage(newProject.description)
    newProject.rewards = JSON.stringify(newProject.json_metadata.rewards).toString().replace(/\'/g, "''")
    newProject.goals = JSON.stringify(newProject.json_metadata.goals).toString().replace(/\'/g, "''")
    newProject.json_metadata = JSON.stringify(newProject.json_metadata).toString().replace(/\'/g, "''")
  } catch (e) {
    console.log(e)
  }
  return newProject;
}


function parseUpdate(update) {
  var newUpdate = {}
  try {
    newUpdate.json_metadata = JSON.parse(update.json_metadata)
  } catch (e) {
    console.log(e)
  }
  if (!newUpdate) newUpdate = {}
  newUpdate.author = update.author
  newUpdate.permlink = update.permlink
  newUpdate.category = update.category
  newUpdate.parent_author = update.parent_author
  newUpdate.parent_permlink = update.parent_permlink
  newUpdate.title = update.title.toString().replace(/\'/g, "''")
  newUpdate.body = update.body.toString().replace(/\'/g, "''")
  newUpdate.last_update = update.last_update
  newUpdate.created = update.created
  newUpdate.active = update.active
  newUpdate.last_payout = update.last_payout
  newUpdate.depth = update.depth
  newUpdate.children = update.children
  newUpdate.net_rshares = update.net_rshares
  newUpdate.abs_rshares = update.abs_rshares
  newUpdate.vote_rshares = update.vote_rshares
  newUpdate.children_abs_rshares = update.children_abs_rshares
  newUpdate.cashout_time = update.cashout_time
  newUpdate.max_cashout_time = update.max_cashout_time
  newUpdate.total_vote_weight = update.total_vote_weight
  newUpdate.reward_weight = update.reward_weight
  newUpdate.total_payout_value = update.total_payout_value
  newUpdate.curator_payout_value = update.curator_payout_value
  newUpdate.author_rewards = update.author_rewards
  newUpdate.net_votes = update.net_votes
  newUpdate.root_comment = update.root_comment
  newUpdate.max_accepted_payout = update.max_accepted_payout
  newUpdate.percent_steem_dollars = update.percent_steem_dollars
  newUpdate.allow_replies = update.allow_replies
  newUpdate.allow_votes = update.allow_votes
  newUpdate.allow_curation_rewards = update.allow_curation_rewards

  newUpdate.url = update.url
  newUpdate.root_title = update.root_title.toString().replace(/\'/g, "''")
  newUpdate.pending_payout_value = update.pending_payout_value
  newUpdate.total_pending_payout_value = update.total_pending_payout_value

  newUpdate.replies = update.replies
  newUpdate.author_reputation = update.author_reputation
  newUpdate.promoted = update.promoted
  newUpdate.body_length = update.body_length
  newUpdate.reblogged_by = update.reblogged_by
  newUpdate.body_language = update.body_language
  newUpdate.tags = newUpdate.json_metadata.tags
  newUpdate.update = newUpdate.json_metadata.update
  newUpdate.voters = displayVoter(update.active_votes, 0)

  newUpdate.payout = displayPayout(update.pending_payout_value, update.total_payout_value, update.curator_payout_value)
  for (z = 0; z <  newUpdate.voters.length; z++) {
    newUpdate.voters[z].upvote = Number(parseFloat(payoutupvote(newUpdate.voters[z].rsharespercent, newUpdate.payout)).toFixed(3))
    if(newUpdate.voters[z].upvote > 0)
    {
      delete newUpdate.voters[z].weight
      delete newUpdate.voters[z].rshares
      delete newUpdate.voters[z].percent
      delete newUpdate.voters[z].rsharespercent
      delete newUpdate.voters[z].reputation
    }
    else{

      newUpdate.voters.splice([z],1)
    }
  }
 

  for (i = 0; newUpdate.tags.length > i; i++) {
    if (newUpdate.tags[i].includes('fundition_')) {
      newUpdate.project = newUpdate.tags[i].split('_')[1]
      console.log(newUpdate.project)
    }
    if (newUpdate.tags[i].includes('fundition-')) {
      newUpdate.project = newUpdate.tags[i].split('-')[1]
      console.log(newUpdate.project)
    }
  }
  try {
    newUpdate.voters = JSON.stringify(newUpdate.voters)
    newUpdate.beneficiaries = JSON.stringify(update.beneficiaries)
    newUpdate.active_votes = JSON.stringify(update.active_votes)
    newUpdate.image = setImage(newUpdate.body)
    newUpdate.json_metadata = JSON.stringify(newUpdate.json_metadata).toString().replace(/\'/g, "''")
  } catch (e) {
    console.log(e)
  }

  return newUpdate;
}


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

function payoutupvote(share, rewards) {
  return (parseFloat(share) * rewards).toFixed(3);
}
var steemprice
var sbdprice

function SBD() {
  var xtr = new XMLHttpRequest();
  xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem-dollars/', true);
  xtr.send();
  xtr.onreadystatechange = function () {
    if (xtr.readyState == 4) {
      if (xtr.status == 200) {
        if (xtr.responseText) {
          var ticker = JSON.parse(xtr.responseText)
          totalUSD = ticker[0].price_usd
          sbdprice = parseFloat(totalUSD).toFixed(3)
        }
      } else {
        console.log("Error: API not responding!");
      }
    }
  }
}

function STEEM() {
  var xtr = new XMLHttpRequest();
  xtr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/steem/', true);
  xtr.send();
  xtr.onreadystatechange = function () {
    if (xtr.readyState == 4) {
      if (xtr.status == 200) {
        if (xtr.responseText) {
          var ticker = JSON.parse(xtr.responseText)
          totalUSD =  ticker[0].price_usd
          steemprice = parseFloat(totalUSD).toFixed(3)
        }
      } else {
        console.log("Error: API not responding!");
      }
    }
  }
}

function displayPayout(active, total, voter) {
  if (active && !total || !voter) return active
  if (!active || !total || !voter) return
  var payout = active
  if (total.split(' ')[0] > 0) {
      var amount = parseInt(total.split(' ')[0].replace('.', '')) + parseInt(voter.split(' ')[0].replace('.', ''))
      amount /= 1000
      payout = amount + ' SBD'
  }
  if (!payout) return
  var amount = payout.split(' ')[0]
  var currency = payout.split(' ')[1]
  amount = parseFloat(amount).toFixed(3)
  amount -= (amount / 100) * 25
  amount = ((amount /2) * steemprice)+((amount/2)* sbdprice)
  return parseFloat(amount).toFixed(3)
}

function displayVoter(votes, isDownvote) {
  if (!votes) return
  votes.sort(function (a, b) {
    var rsa = parseInt(a.rshares)
    var rsb = parseInt(b.rshares)
    return rsb - rsa
  })
  if (isDownvote) votes.reverse()

  var rsharesTotal = 0;
  for (let i = 0; i < votes.length; i++)
    rsharesTotal += parseInt(votes[i].rshares)

  var voters = []
  for (let i = 0; i < votes.length; i++) {
    if (i == votes.length) break
    votes[i].rsharespercent = parseInt(votes[i].rshares) / rsharesTotal
    if (parseInt(votes[i].rshares) < 0 && !isDownvote) break;
    if (parseInt(votes[i].rshares) >= 0 && isDownvote) break;
    voters.push(votes[i])
  }
  return voters
}


module.exports = router;