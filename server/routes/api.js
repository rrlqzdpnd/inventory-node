const express = require('express')
const { Pool } = require('pg')
const router = express.Router()

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_errol'
})

var returnMessage = function(resObj, isSuccess, body = {}) {
  const reply = {
    success: true
  };
  if(!isSuccess)
    reply.success = false;

  reply.body = body;
  resObj.json(reply);
}

router.get('/', (req, res) => {
  res.send('API works!')
})

router.post('/newType', (req, res) => {
  var checkTableName = (body, callback, count = 1) => {
    let transform = body.name.trim().toLowerCase();
    transform = transform.replace(/\s+/g, '_');
    transform += (count == 1) ? '' : ('_' + count);

    let s = "SELECT 1 " +
    "FROM information_schema.tables " +
    "WHERE table_name = \'" + transform + "\'"
    console.log("Checking name:", transform);

    let query = pool.query(s);
    query.then((res) => {
      if(res.rows.length == 0) {

        let isValid = validateProperties(body.properties);
        if(isValid)
          callback(transform, body.properties);
        else
          returnMessage(res, false);
      }
      else
        checkTableName(body, callback, count+1);
    }).catch((err) => {
      returnMessage(res, false);
    })
  };

  var validateProperties = (props) => {
    return true;
  };

  checkTableName(req.body, (name, props) => {
    // console.log(name, props);
    console.log("Using name:", name);

    returnMessage(res, true);
  });
})

module.exports = router;
