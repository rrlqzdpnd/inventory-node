const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_errol'
})
const DataType = {
  String: 0,
  Integer: 1,
  Boolean: 2
}

const returnMessage = function(resObj, isSuccess, body = {}) {
  const reply = {
    success: true
  };
  if(!isSuccess)
    reply.success = false;

  reply.body = body;
  resObj.json(reply);
}

const router = express.Router();

router.get('/products/:query?', (req, res) => {
  pool.connect()
  .then((client) => {
    let paramQuery = req.params.query;

    let s = "SELECT id, name FROM meta_product_types";
    let query;
    if(!paramQuery)
      query = client.query(s);
    else {
      s += " WHERE name ILIKE $1";
      query = client.query(s, [ '%' + paramQuery + '%' ]);
    }

    query.then((result) => {
      returnMessage(res, true, { products: result.rows });
      client.release();
    })
    .catch((err) => {
      returnMessage(res, false, { messsage: "Error fetching data from database" });
      client.release();
    })
  })
  .catch((err) => {
    returnMessage(res, false, { message: "Error connecting to database" });
    client.release();
  })
});

router.post('/newType', (req, res) => {
  let checkTableName = (body, callback, count = 1) => {
    let tblName = body.name.trim().toLowerCase();
    tblName = tblName.replace(/\s+/g, '_');
    tblName += (count == 1) ? '' : ('_' + count);
    tblName = "inv_" + tblName;

    let s = "SELECT 1 \
    FROM information_schema.tables \
    WHERE table_name = \'" + tblName + "\'";

    let query = pool.query(s);
    query.then((result) => {
      if(result.rows.length == 0)
        callback(tblName, body.properties);
      else
        checkTableName(body, callback, count + 1);
    }).catch((err) => {
      returnMessage(res, false, { message: "Database error. Please try again" });
    })
  };

  let validateProps = (body, callback) => {
    let isValid = true;

    if(!body.name)
      isValid = false;

    body.properties.forEach((prop) => {
      if(!prop.name)
        isValid = false;
    })

    if(isValid)
      checkTableName(body, callback);
    else
      returnMessage(res, false, { message: "Input is not valid" });
  };

  let createTable = (name, props) => {
    let s = "CREATE TABLE " + name + "("
    props.forEach((prop) => {
      let colName = prop.name.toLowerCase();
      colName = colName.replace(/\s+/g, '_');
      colName += "_" + prop.id;

      s += colName;
      switch(prop.type) {
        case DataType.String:
          s += " varchar(" + prop.length + ")";
          break;
        case DataType.Integer:
          s += " integer";
          break;
        case DataType.Boolean:
          s += " boolean";
          break;
        default:
          returnMessage(res, false, { message: "Unknown data type" });
          break;
      }
      if(prop.isRequired)
        s += " not null";

      s += ",";
    });
    s = s.replace(/,$/, '') + ')';

    let query = pool.query(s);
    query.then((result) => {
      let s = "INSERT INTO meta_product_types(name, slug) VALUES ($1, $2) RETURNING id";
      let query2 = pool.query(s, [req.body.name, name]);
      query2.then((result) => {
        let newType = {
          id: result.rows[0].id,
          name: req.body.name
        };
        returnMessage(res, true, { newType: newType });
      }).catch((err) => {
        returnMessage(res, false, { message: "Error creating new product in database" })
      });
    })
    .catch((err) => {
      returnMessage(res, false, { message: "Error creating table" });
    });
  }

  validateProps(req.body, createTable);
})

module.exports = router;
