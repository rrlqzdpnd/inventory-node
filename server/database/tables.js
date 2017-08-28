const pg = require('pg');

const dbString = "postgres://postgres@localhost/inventory_errol";
const client = new pg.Client(dbString);

module.exports = client;
