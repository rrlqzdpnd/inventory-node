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

/**
 * replies in Json format with specific body
 */
const returnMessage = function(resObj, isSuccess, body = {}) {
  const reply = {
    success: true
  };
  if(!isSuccess)
    reply.success = false;

  reply.body = body;
  resObj.json(reply);
}

/**
 * takes two dimensional arrays and prepares them into parenthesis-grouped,
 * comma separated string
 * Assumes inner arrays have the same length
 */
const prepareArray = function(arr, startCount = 1) {
  let flat = [].concat(...arr);

  let count = startCount;
  let indexes =  arr.map(i =>
    "(" + i.map(j =>
      `$${count++}`
    ).join(",") + ")"
  ).join(',');

  return [indexes, flat];
}

const router = express.Router();

router.get('/product/:id', (req, res) => {
  pool.connect()
  .then((client) => {
    let productId = parseInt(req.params.id);
    var product = {
      id: productId
    };

    client.query({
      text: "SELECT name, slug FROM inv_products WHERE id = $1 AND is_active = TRUE",
      values: [ productId ]
    })
    .then((result) => {
      if(!result.rows) {
        client.release();
        throw "Product not found.";
      }

      product.name = result.rows[0].name;
      product.slug = result.rows[0].slug;

      return client.query({
        text: "SELECT id, name, slug, type, is_required FROM inv_product_columns WHERE product_id = $1",
        values: [ productId ]
      });
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

      return client.query({
        text: "SELECT iic.item_id, iic.value, ipc.slug, ipc.product_id\
        FROM inv_item_columns iic\
        JOIN inv_product_columns ipc\
        ON ipc.id = iic.column_id\
        WHERE ipc.product_id = $1",
        values: [ productId ]
      });
    })
    .then((result) => {
      let items = {};
      result.rows.forEach((row) => {
        if(!items[row.item_id])
          items[row.item_id] = {};

        items[row.item_id].id = row.item_id;
        items[row.item_id][row.slug] = row.value;
      });

      product.items = Object.values(items);

      client.release();
      returnMessage(res, true, { product: product });
    })
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
  var productId = parseInt(req.params.id);

  let validate = async (client) => {
    let body = req.body;
    let keys = Object.keys(body);

    if(keys.length < 1)
      return Promise.resolve(false);

    for(let id of keys) {
      let item = body[id];
      if(item.type != DataType[DataType.Boolean] && item.is_required && !item.value)
        return Promise.resolve(false);
    }

    let ids = keys.map((id) => parseInt(id));
    let [ idx, vals ] = prepareArray([ ids ], 2);
    return await client.query({
      text: "SELECT 1 FROM inv_product_columns WHERE product_id = $1 AND id IN " + idx,
      values: [ productId ].concat(...vals)
    })
    .then((result) => {
      if(result.rows.length == keys.length)
        return Promise.resolve(true);
      return Promise.resolve(false);
    })
    .catch((err) => {
      return Promise.resolve(false);
    });
  };

  let clientProm = pool.connect();

  clientProm.then((client) => {
    return validate(client).then((isValid) => {
      if(!isValid)
        return Promise.reject('Input not valid');

      return client.query("BEGIN");
    })
    .then((result) => {
      return client.query({
        text: "INSERT INTO inv_items(product_id) VALUES ($1) RETURNING id",
        values: [ productId ]
      });
    })
    .then((result) => {
      let itemId = result.rows[0].id;
      let cleanProps = Object.keys(req.body).map((id) => {
        let prop = req.body[id];
        let row = [];

        row.push(parseInt(itemId));
        row.push(parseInt(id));
        row.push(prop.value);

        return row;
      });
      let [ idx, flat ] = prepareArray(cleanProps);

      return client.query({
        text: "INSERT INTO inv_item_columns(item_id, column_id, value) VALUES " + idx + " RETURNING id",
        values: flat
      });
    })
    .then((result) => {
      let cleanProps = result.rows.map((row) => {
        return parseInt(row.id);
      });
      let [ idx, flat ] = prepareArray([ cleanProps ]);

      return client.query({
        text: "SELECT iic.item_id, iic.value, ipc.slug, ipc.product_id\
        FROM inv_item_columns iic\
        JOIN inv_product_columns ipc\
        ON ipc.id = iic.column_id\
        WHERE iic.id IN " + idx,
        values: flat
      });
    })
    .then((result) => {
      let reply = result.rows.reduce((acc, curr) => {
        acc.id = curr.item_id;
        acc[curr.slug] = curr.value;
        return acc;
      }, {});

      client.release();
      returnMessage(res, true, { newItem: [ reply ] });
      return client.query("COMMIT");
    })
    .catch((err) => {
      client.query("ROLLBACK");
      client.release();
      return Promise.reject("Error inserting into the database");
    })
  })
  .catch((err) => {
    returnMessage(res, false, { message: err });
  });
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
      throw "Database error";
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

    return client.query({
      text: "INSERT INTO inv_products(name, slug) VALUES ($1, $2) RETURNING id",
      values: [req.body.name, name]
    })
    .then((result) => {
      productId = result.rows[0].id;

      let cleanProps = req.body.properties.map((prop) => {
        let row = [];
        row.push(productId);
        row.push(prop.name);

        let propSlug = prop.name.trim().toLowerCase();
        propSlug = propSlug.replace(/\s+/g, '_');
        row.push(propSlug);

        row.push(DataType[prop.type]);
        row.push(prop.isRequired);

        return row;
      });
      let [ idx, vals ] = prepareArray(cleanProps);

      return client.query({
        text: "INSERT INTO inv_product_columns(product_id, name, slug, type, is_required) VALUES " + idx,
        values: vals
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
