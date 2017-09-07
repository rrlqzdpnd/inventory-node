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
  Boolean: 2,
  0: "String",
  1: "Integer",
  2: "Boolean",
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
    let productId = parseInt(req.params.id);
    var product = {
      id: productId
    };

    client.query("SELECT name, slug FROM inv_products WHERE id = $1 AND is_active = TRUE", [ productId ])
    .then((result) => {
      if(!result.rows) {
        client.release();
        throw "Product not found.";
      }

      product.name = result.rows[0].name;
      product.slug = result.rows[0].slug;

      return client.query("SELECT id, name, slug, type, is_required FROM inv_product_columns WHERE product_id = $1", [ productId ]);
    })
    .then((result) => {
      let columns = [];
      let column
      result.rows.forEach((row) => {
        columns.push({
          id: row.id,
          name: row.name,
          slug: row.slug,
          type: row.type,
          is_required: row.is_required
        });
      });
      product.columns = columns;

      product.items = [];

      client.release();
      returnMessage(res, true, { product: product });
    })
    // .then((result) => {
    // })
    .catch((err) => {
      client.release();
      throw "Error fetching product";
    });
  })
  .catch((err) => {
    returnMessage(res, false, { message: "Error connecting to database" });
  })
});

router.post('/product/:id', (req, res) => {
  console.log(req.body);
});

router.get('/products/:query?', (req, res) => {
  let clientProm = pool.connect();
  clientProm.then((client) => {
    let paramQuery = req.params.query;

    let s = "SELECT id, name FROM inv_products";
    let query;
    if(!paramQuery)
      query = client.query(s);
    else {
      s += " WHERE name ILIKE '%'||$1||'%'";
      query = client.query(s, [ paramQuery ]);
    }

    return query
    .then((result) => {
      returnMessage(res, true, { products: result.rows });
      client.release();
    })
    .catch((err) => {
      client.release();
      throw "Error fetching data from database";
    })
  })
  .catch((err) => {
    returnMessage(res, false, { message: err });
  })
});

router.post('/newType', (req, res) => {
  // start of validation
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

  // end of validation; will not go here if input is invalid
  let checkProduct = (client, body, count = 1) => {
    let productName = body.name.trim().toLowerCase();
    productName = productName.replace(/\s+/g, '_');
    productName += (count == 1) ? '' : ('_' + count);

    let s = "SELECT 1 FROM inv_products WHERE slug = $1";

    return client.query(s, [ productName ])
    .then((result) => {
      if(result.rows.length == 0)
        return Promise.resolve(productName);
      else
        return checkProduct(client, body, count + 1);
    })
    .catch((err) => {
      client.release();
      throw "Database error. Please try again";
    });
  };

  let clientProm = pool.connect();

  let nameProm = clientProm.then((client) => {
    return checkProduct(client, req.body);
  });

  let transProm = clientProm.then((client) => {
    return client.query("BEGIN")
  });

  let allProm = Promise.all([clientProm, nameProm, transProm]);
  allProm.then(([client, name, trans]) => {
    var productId = 0;

    return client.query("INSERT INTO inv_products(name, slug) VALUES ($1, $2) RETURNING id", [req.body.name, name])
    .then((result) => {
      productId = result.rows[0].id;

      let chunks = [], values = [];
      req.body.properties.forEach((prop) => {
        let row = [];

        // product_id
        values.push(productId);
        row.push('$' + values.length);

        // name
        values.push(`${prop.name}`);
        row.push('$' + values.length);

        // slug
        let propSlug = prop.name.trim().toLowerCase();
        propSlug = propSlug.replace(/\s+/g, '_');
        values.push(`${propSlug}`);
        row.push('$' + values.length);

        // type
        values.push(DataType[prop.type]);
        row.push('$' + values.length);

        // is_required
        values.push(prop.isRequired);
        row.push('$' + values.length);

        chunks.push("(" + row.join(',') + ")");
      });

      return client.query({
        text: "INSERT INTO inv_product_columns(product_id, name, slug, type, is_required) VALUES " + chunks.join(','),
        values: values
      });
    })
    .then((result) => {
      return client.query("COMMIT")
    })
    .then((result) => {
      client.release();
      return Promise.resolve({
        id: productId,
        name: req.body.name
      })
    })
    .catch((err) => {
      client.query('ROLLBACK');
      client.release();
      throw "Error creating new product";
    })
  })
  .then((result) => {
    returnMessage(res, true, { newType: result });
  })
  .catch((err) => {
    returnMessage(res, false, { message: err });
  });
})

module.exports = router;
