const pgp = require('pg-promise')();

const user = "postgres";
const password = "docker";
const host = "127.0.0.1";
const port = 5432;
const database = "MovieServer";

const db = pgp(`postgres://${user}:${password}@${host}:${port}/${database}`);




module.exports = db;