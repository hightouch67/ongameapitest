const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
var mysql = require('mysql');
const router = express.Router();
const sql = require('mssql')
const steem = require('steem');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const rp = require('request-promise');

steem.api.setOptions({ url: 'https://api.steemit.com' });


router.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

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

router.get("/api/getuserprojects/:author", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT permlink FROM projects WHERE author='${req.params.author}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})
var projects;
router.get("/api/getprojects", function (req, res) {
  var now = new Date().getMinutes();
  if(projects && projects.time === now)
  {
    res.json(projects.projects)
  }
  else{
    if(projects&&projects.projects)
    {
      res.json(projects.projects)
    }
    pool1.getConnection(function (error, connection) {
      var query = `SELECT p.author, p.permlink, p.created, p.title, p.image, p.mode, p.tags,  p.type, p.payout, p.goals,
      (SELECT SUM(d.amount) FROM donations d WHERE d.memo LIKE concat('%',p.permlink,'%')) as donation ,
      (SELECT SUM(u.payout) FROM updates u WHERE u.project = p.permlink) as update_payout FROM projects p
      WHERE p.type !='off'
      group by p.permlink
      order by p.created DESC`
      connection.query(query, function (err, result) {
        if (err) return;
        else
          projects = { projects: result, time: now };
        connection.release();
      })
    })
  }
})

router.get("/api/getprojectvotes", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT author, permlink, image, active_votes, type FROM projects`
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
    var query = `SELECT author, permlink, created, title, image, mode, tags, payout, type, json_metadata FROM projects`
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
    var query = `SELECT date, amount, name, memo, project, link FROM donations`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/gettrxdonations", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT * FROM trx_donations`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getrecentdonations", function (req, res) {
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
    var query = `SELECT * FROM donations WHERE date > '${date}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getmonthlydonations", function (req, res) {
  var date = new Date();
  date.setDate(date.getDate() - 31);
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
    var query = `SELECT * FROM donations WHERE date > '${date}'`
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
    var query = `SELECT author, permlink, title, created, mode, project, active_votes FROM updates`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getfullrecentupdates", function (req, res) {
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
    var query = "SELECT author, permlink, created, mode, title, active_votes, project FROM updates WHERE created > '" + date + "'"
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

var updates;
router.get("/api/getrecentupdates", function (req, res) {
  var now = new Date().getMinutes();
  if(updates && updates.time === now)
  {
    res.json(updates.updates)
  }
  else{
    if(updates&&updates.updates)
    {
      res.json(updates.updates)
    }
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
        updates = { updates: result, time: now };
        connection.release();
      })
    })
  }
})


router.get("/api/getrecentupdatesdetails", function (req, res) {
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
    var query = "SELECT author, permlink, active_votes, title, created, mode, project FROM updates WHERE created > '" + date + "'"
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
    var query = `SELECT author, permlink, body, created, title, project, payout, voters FROM updates where project='${req.params.permlink}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})


router.get("/api/state/:permlink", function (req, res) {
  console.log(req.params.permlink)
  pool1.getConnection(function (error, connection) {
    let query = `SELECT  (
      SELECT SUM(payout)
      FROM  projects WHERE permlink = '${req.params.permlink}'
      ) AS amount_p ,
      (
      SELECT SUM(payout)
      FROM   updates WHERE project = '${req.params.permlink}'
      ) AS amount_u,
      (
      SELECT SUM(amount)
      FROM   donations where memo like '%${req.params.permlink}%'
      ) AS amount_d`
    connection.query(query, function (err, result) {
      if (err){
        console.log(err)
        return
      }
      else
      if(result)
      {
        let total = 0;
        if(result[0].amount_p != null)
        total+=Number(result[0].amount_p)
        if(result[0].amount_u != null)
        total+=Number(result[0].amount_u)
        if(result[0].amount_d != null)
        total+=Number(result[0].amount_d)
        console.log(total,result[0])
        res.json(parseFloat(total).toFixed(3))
        connection.release();
      }

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
        body_language='${post.body_language}', image='${post.image}', tags='${post.tags}',voters='${post.voters}', payout='${post.payout}' WHERE permlink='${req.params.permlink}'
        `
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
      res.json('error')
    }
  })
})

router.get("/api/adddonation/:id/:name/:project/:amount/:memo/:sent/", function (req, res) {
  var today = new Date()
  var dd = today.getUTCDate();
  var mm = today.getUTCMonth() + 1; //January is 0!
  var yyyy = today.getUTCFullYear();
  today = yyyy + '/' + mm + '/' + dd;
  if (dd < 10) {
      dd = '0' + dd
  }
  if (mm < 10) {
      mm = '0' + mm
  }
  today = yyyy + '/' + mm + '/' + dd 
  var query = `INSERT INTO donations (date, id, name, project, amount, memo, sent_amount) VALUES ('${today}','${req.params.id}','${req.params.name}','${req.params.project}','${req.params.amount}','${req.params.memo}','${req.params.sent}')`
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

router.get("/api/addtrxdonation/:id/:name/:project/:amount/:memo/:sent/", function (req, res) {
  var today = new Date()
  var dd = today.getUTCDate();
  var mm = today.getUTCMonth() + 1; //January is 0!
  var yyyy = today.getUTCFullYear();
  today = yyyy + '/' + mm + '/' + dd;
  if (dd < 10) {
      dd = '0' + dd
  }
  if (mm < 10) {
      mm = '0' + mm
  }
  today = yyyy + '/' + mm + '/' + dd 
  var query = `INSERT INTO trx_donations (date, id, name, project, amount, memo, sent_amount) VALUES ('${today}','${req.params.id}','${req.params.name}','${req.params.project}','${req.params.amount}','${req.params.memo}','${req.params.sent}')`
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


router.get("/api/addtip/:name/:amount/:type/:permlink/:id/", function (req, res) {
  var today = new Date()
  var dd = today.getUTCDate();
  var mm = today.getUTCMonth() + 1; //January is 0!
  var yyyy = today.getUTCFullYear();
  today = yyyy + '/' + mm + '/' + dd;
  if (dd < 10) {
      dd = '0' + dd
  }
  if (mm < 10) {
      mm = '0' + mm
  }
  today = yyyy + '/' + mm + '/' + dd 
  var query = `INSERT INTO tips (date, name, amount,type, permlink, id) VALUES ('${today}','${req.params.name}','${req.params.amount}','${req.params.type}','${req.params.permlink}','${req.params.id}')`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('tip inserted')
      res.json(result)
    })
  })
})

router.get("/api/tips/:permlink", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM tips WHERE permlink='" + req.params.permlink + "'"
    connection.query(query, function (err, result) {
      if (err) return (err);
      else
        res.json(result)
      connection.release();
    })
  })
})


loadSingle = function (author, permlink, cb) {

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
                  reblogged_by, body_language, image, rewards, goals, thanks_message, description, socials, tags, project, type, project_type,payout ) 
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
          '${post.socials}','${post.tags}','${post.project}','${req.params.type}','${post.project_type}',${post.payout})
      ON DUPLICATE KEY UPDATE  
      title='${post.title}', body='${post.body}', json_metadata='${post.json_metadata}', 
      last_update='${post.last_update}', last_payout='${post.last_payout}',active='${post.active}',
      cashout_time='${post.max_cashout_time}', total_payout_value='${post.total_payout_value}' ,curator_payout_value='${post.curator_payout_value}' 
      ,author_rewards='${post.author_rewards}' ,net_votes='${post.net_votes}' ,pending_payout_value='${post.pending_payout_value}'
      ,total_pending_payout_value='${post.total_pending_payout_value}' ,active_votes='${post.active_votes}', image='${post.image}'
      ,rewards='${post.rewards}' ,goals='${post.goals}' ,thanks_message='${post.thanks}' ,description='${post.description}' ,socials='${post.socials}' 
      ,tags='${post.tags}' ,project_type='${post.project_type}', payout = ${post.payout}`
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
        body_language, image, tags, project, payout ) 
      VALUES
          ('${post.author}','${post.permlink}','${post.category}','${post.parent_author}','${post.parent_permlink}',
          '${post.title}','${post.body}','${post.json_metadata}','${post.last_update}','${post.created}','${post.active}','${post.last_payout}',
          '${post.depth}','${post.children}','${post.net_rshares}','${post.abs_rshares}','${post.vote_rshares}','${post.children_abs_rshares}',
          '${post.cashout_time}','${post.max_cashout_time}','${post.total_vote_weight}','${post.reward_weight}','${post.total_payout_value}',
          '${post.curator_payout_value}','${post.author_rewards}','${post.net_votes}','${post.root_comment}','${post.mode}','${post.max_accepted_payout}',
          '${post.percent_steem_dollars}','${post.allow_replies}','${post.allow_votes}','${post.allow_curation_rewards}','${post.beneficiaries}',
          '${post.url}','${post.root_title}','${post.pending_payout_value}','${post.total_pending_payout_value}','${post.active_votes}',
          '${post.replies}','${post.author_reputation}','${post.promoted}','${post.body_length}','${post.reblogged_by}','${post.body_language}',
          '${post.image}','${post.tags}','${post.project}',${post.payout})
          ON DUPLICATE KEY UPDATE  
          title='${post.title}', body='${post.body}', json_metadata='${post.json_metadata}', 
          last_update='${post.last_update}', last_payout='${post.last_payout}',active='${post.active}',
          cashout_time='${post.max_cashout_time}', total_payout_value='${post.total_payout_value}' ,curator_payout_value='${post.curator_payout_value}' 
          ,author_rewards='${post.author_rewards}' ,net_votes='${post.net_votes}' ,pending_payout_value='${post.pending_payout_value}'
          ,total_pending_payout_value='${post.total_pending_payout_value}' ,active_votes='${post.active_votes}', image='${post.image}'
          ,tags='${post.tags}', payout = ${post.payout}`
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

router.get("/api/getcontent/:author/:permlink", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = `SELECT * FROM ongamecontents where author='${req.params.author}' AND permlink='${req.params.permlink}'`
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
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

router.get("/api/market/items", function (req, res) {
  var query = `SELECT * FROM ongamemarket`
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

router.get("/api/allgifts", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM gift"
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

router.get("/api/link/:user/youtube/:channelid", function (req, res) {
  var query = `INSERT INTO ongameusers (username, youtube_id) VALUES ('${req.params.user}','${req.params.channelid}') 
  ON DUPLICATE KEY UPDATE youtube_id='${req.params.channelid}'`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('youtube ongameuser inserted')
      res.json(result)
    })
  })
})

router.get("/api/link/:user/:type/:userid", function (req, res) {
  var query = `INSERT INTO ongameusers (username, ${req.params.type}) VALUES ('${req.params.user}','${req.params.userid}') 
  ON DUPLICATE KEY UPDATE ${req.params.type}=${req.params.userid}`
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

router.get("/api/addscore/:user/:type/:score", function (req, res) {
  var query = `INSERT INTO ongameusers (username, ${req.params.type}) VALUES ('${req.params.user}','${req.params.score}') ON DUPLICATE KEY UPDATE ${req.params.type}=${req.params.type}+1`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('ongameuser ' + req.params.type + ' updated')
      res.json(result)
    })
  })
})

router.get("/api/addaccount/:user/:wallet", function (req, res) {
  var query = `INSERT INTO ongameusers (username, trx_wallet,avatar) VALUES ('${req.params.user}','${req.params.wallet}','ongame')`
  pool1.getConnection(function (error, connection) {
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err)
        res.json(err);
        connection.release();
      }
      else
        console.log('ongameuser ' + req.params.user + ' inserted')
      res.json(result)
    })
  })
})

router.get("/api/getlinks/:user", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT * FROM ongameusers WHERE username='" + req.params.user + "'"
    connection.query(query, function (err, result) {
      if (err) return (err);
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getgamecontents/:game", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT author, permlink FROM ongamecontents WHERE game=" + req.params.game 
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getusercontents/:author", function (req, res) {
  pool1.getConnection(function (error, connection) {
    var query = "SELECT author, permlink FROM ongamecontents WHERE author=" + req.params.author 
    connection.query(query, function (err, result) {
      if (err) return;
      else
        res.json(result)
      connection.release();
    })
  })
})

router.get("/api/getrecentgamecontents", function (req, res) {
  var date = new Date();
  date.setDate(date.getDate() - 30);
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
    var query = "SELECT author, permlink, game FROM ongamecontents WHERE created > '" + date + "'"
    connection.query(query, function (err, result) {
      if (err) return;
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

  newProject.payout = displayPayout(project.pending_payout_value, project.total_payout_value, project.curator_payout_value)
  newProject.voters = displayVoter(project.active_votes, 0)

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
  if(newProject.payout)
  newProject.payout = Number(newProject.payout)/100*45;
  else{
    newProject.payout = 0
  }
  console.log(newProject.payout = newProject.payout/100*45)
  try {
    newProject.voters = JSON.stringify(newProject.voters)
    newProject.beneficiaries = JSON.stringify(project.beneficiaries)
    newProject.active_votes = JSON.stringify(project.active_votes)
    newProject.thanks = JSON.stringify(newProject.json_metadata.thanks.message).toString().replace(/\'/g, "''")
    newProject.description = JSON.stringify(newProject.json_metadata.basics.description).toString().replace(/\'/g, "''")
    newProject.image = setImage(newProject.description)
    newProject.project_type = newProject.json_metadata.basics.type
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
    console.log(newUpdate.voters[z].upvote)
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
  console.log(newUpdate.payout)
  if(newUpdate.payout)
  newUpdate.payout = Number(newUpdate.payout)/100*45;
  else{
    newUpdate.payout = 0
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

var steemprice
var sbdprice

router.get("/api/sbdprice", function (req, res) {
  res.json(sbdprice)
})

const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
  qs: {
    'start': '1',
    'limit': '600',
    'convert': 'USD'
  },
  headers: {
    'X-CMC_PRO_API_KEY': '44994647-b39b-412d-82d8-8f78589deb7e'
  },
  json: true,
  gzip: true
};
var allcoins = {};
router.get("/api/allcoins", function (req, res) {
  var bnow = new Date().getHours()
  if(allcoins && allcoins.lasttime && allcoins.lasttime=== bnow)
  {
    res.json(allcoins.data)
  }
  else{
    const next = new Date().getHours();
    rp(requestOptions).then(response => {
      var data = response.data
      allcoins.data = data;
      allcoins.lasttime = next;
      var steem = data.find(rep => rep.name === 'Steem')
      steemprice = parseFloat(steem.quote.USD.price).toFixed(3);
      var priceofsbd = data.find(rep => rep.name === 'Steem Dollars')
      sbdprice = parseFloat(priceofsbd.quote.USD.price).toFixed(3);
      res.json(data)
    }).catch((err) => {
      console.log('API call error:', err.message);
      res.json(err)
    });
  }

})

router.get("/api/convertcoin", function (req, res) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://apilayer.net/api/live?access_key=a4d5d62cc69c3cb2fea2fb9fd4402852&currencies=EUR,GBP,CAD,PLN,TRY,CNY,IDR,KRW,PHP,JPY&source=USD&format=1', true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                if (xhr.responseText) {
                    var ticker = JSON.parse(xhr.responseText)
                    res.json(ticker.quotes)
                }
            } else {
                console.log("Error: API not responding!");
            }
        }
    }
})

function payoutupvote(share, rewards) {
  return (parseFloat(share) * rewards).toFixed(3);
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
  console.log(payout)

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

// router.get("/api/getaadonations", function (req, res) {
//   pool1.getConnection(function (error, connection) {
//     const query = `SELECT * FROM donations_copy1`
//     connection.query(query, function (err, result) {
//       if (error) return;
//       else
//       for(i=0;result.length>i;i++)
//       {
//         const trx = result[i]
//         Dome(trx)
//         if(i===result.length-1)
//         {
//           res.json(result)
//           connection.release();
//         }
//       }
//     })
//   })
// })

// function Dome(trx){
//         if(trx.symbol ==="SBD" && !trx.sent_amount)
//         {
//           var dd = trx.date.getDate();
//           var mm = trx.date.getMonth() + 1; //January is 0!
//           var yyyy = trx.date.getFullYear();
//           if (dd < 10) {
//             dd = '0' + dd
//           }
//           if (mm < 10) {
//             mm = '0' + mm
//           }
//           var amount = trx.amount.replace(',','.')
//           var ss = trx.amount +' ' +trx.symbol
//           var date = yyyy + '/' + mm + '/' + dd;
//           pool1.getConnection(function (error, nexconnection) {
//             const query = `SELECT usd FROM steemdollarprice WHERE date='${date}'`
//             nexconnection.query(query, function (err, price) {
//               if (err) return;
//               else
//                 price[0].usd = Number(price[0].usd.replace(',','.'))
//                 var newamount =  amount * price[0].usd
//                 console.log(ss)
//                 pool2.getConnection(function (error, connection) {
//                   var query = `INSERT INTO donations_copy1 (id) VALUES ('${trx.id}') 
//                   ON DUPLICATE KEY UPDATE amount='${newamount}', sent_amount='${ss}'`
//                   connection.query(query, function (err, result) {
//                     if (err) return;
//                     else
//                      console.log(result)
//                     connection.release();
//                   })
//                 })
//             })
//             nexconnection.release()
//           })
//         }
// }

module.exports = router;
