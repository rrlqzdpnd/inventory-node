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

router.get('/product/:id', (req, res) => {
  pool.connect()
  .then((client) => {

  })
  .catch((err) => {
    returnMessage(res, false, { message: "Error connecting to database" });
  })
});

router.get('/products/:query?', (req, res) => {
  pool.connect()
  .then((client) => {
    let paramQuery = req.params.query;

    let s = "SELECT id, name FROM meta_product_types";
    let query;
    if(!paramQuery)
      query = client.query(s);
    else {
      s += " WHERE name ILIKE '%'||$1||'%'";
      query = client.query(s, [ paramQuery ]);
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
  let validateProps = (body) => {
    let isValid = true;

    if(!body.name)
      isValid = false;

    body.properties.forEach((prop) => {
      if(!prop.name)
        isValid = false;
    })

    return isValid;
  }

  if(!validateProps(req.body)) {
    returnMessage(res, false, { message: "Input is not valid" });
    return;
  }

  let checkProduct = (client, body, count = 1) => {
    let productName = body.name.trim().toLowerCase();
    productName = productName.replace(/\s+/g, '_');
    productName += (count == 1) ? '' : ('_' + count);

    let s = "SELECT 1 FROM inv_products WHERE slug = $1";

    return client.query(s, [ productName ])
    .then((result) => {
      if(result.rows.length == 0)
        return Promise.resolve(productName);//createProduct(client, productName, body);
      else
        return checkProduct(client, body, count + 1);
    })
    .catch((err) => {
      client.release();
      throw "Database error. Please try again";
    });
  };

  let createProduct = (client, productName, body) => {
    return client.query("BEGIN");
  }

  let clientProm = pool.connect();
  clientProm.catch((err) => {
    returnMessage(res, false, { message: err });
  });

  let nameProm = clientProm.then((client) => {
    return checkProduct(client, req.body);
  })

  nameProm.then((result) => {
    console.log(result);
  })


  //
  //   let createProduct = (name, body) => {
  //     client.query("BEGIN")
  //     .catch((err) => {
  //       client.query("ROLLBACK");
  //       client.release();
  //       throw "Error with transaction";
  //     })
  //     // let s = "CREATE TABLE " + name + "("
  //     // props.forEach((prop) => {
  //     //   let colName = prop.name.toLowerCase();
  //     //   colName = colName.replace(/\s+/g, '_');
  //     //   colName += "_" + prop.id;
  //     //
  //     //   s += colName;
  //     //   switch(prop.type) {
  //     //     case DataType.String:
  //     //       s += " varchar(" + prop.length + ")";
  //     //       break;
  //     //     case DataType.Integer:
  //     //       s += " integer";
  //     //       break;
  //     //     case DataType.Boolean:
  //     //       s += " boolean";
  //     //       break;
  //     //     default:
  //     //       returnMessage(res, false, { message: "Unknown data type" });
  //     //       break;
  //     //   }
  //     //   if(prop.isRequired)
  //     //     s += " not null";
  //     //
  //     //   s += ",";
  //     // });
  //     // s = s.replace(/,$/, '') + ')';
  //     //
  //     // let query = client.query(s);
  //     // query.then((result) => {
  //     //   let s = "INSERT INTO meta_product_types(name, slug) VALUES ($1, $2) RETURNING id";
  //     //   let query2 = client.query(s, [req.body.name, name]);
  //     //   query2.then((result) => {
  //     //     let newType = {
  //     //       id: result.rows[0].id,
  //     //       name: req.body.name
  //     //     };
  //     //     returnMessage(res, true, { newType: newType });
  //     //     client.release();
  //     //   }).catch((err) => {
  //     //     returnMessage(res, false, { message: "Error creating new product in database" })
  //     //     client.release();
  //     //   });
  //     // })
  //     // .catch((err) => {
  //     //   returnMessage(res, false, { message: "Error creating table" });
  //     //   client.release();
  //     // });
  //   }
  //
  //   let checkProduct = (body, count = 1) => {
  //     let productName = body.name.trim().toLowerCase();
  //     productName = productName.replace(/\s+/g, '_');
  //     productName += (count == 1) ? '' : ('_' + count);
  //
  //     let s = "SELECT 1 FROM inv_products WHERE slug = $1";
  //
  //     return client.query(s, [ productName ])
  //     .then((result) => {
  //       if(result.rows.length == 0)
  //         return createProduct(productName, body);
  //       else
  //         return checkProduct(body, count + 1);
  //     })
  //     .catch((err) => {
  //       client.release();
  //       throw "Database error. Please try again";
  //     });
  //   };
  //
  //   return checkProduct(req.body);
  // })
  // .then((client) => {
  //   console.log('Beginning transaction')
  // })
})

module.exports = router;
