
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const cors = require('../../../lib/cors');
const db = require('../.././../lib/db');
const validateUser = require('../../../lib/validateUser');

export default async (req, res) => {
    return new Promise(async (resolve) => {
        res = cors(res);
        let token  = req.body.token;
        let refreshToken = req.body.refreshToken;
        // If the acces token is incorrect
        if (!validateUser(token, true)) {
            res.status(403).end();
            resolve();
            return;
        }

        
    });
}