const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const jwtSecret = 'SERVERSECRET';
const cors = require('../../../lib/cors');
const db = require('../.././../lib/db');

export default async (req, res) => {
    res = cors(res);
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: req.body.token,
        }),
    })
    .then((r) => r.json())
    .then((data) => {
        if (data.valid) {
            db.any('SELECT id FROM users WHERE username = $1', [data.username])
                .then(user => {
                    if(user.length == 1) {
                        user = user[0];
                        const token = jwt.sign(
                            {
                                username: data.username,
                                user_id: user.id
                            },
                            jwtSecret,
                            {
                                expiresIn: 300000, // 50 min
                            },
                        );
                        res.status(200).json({
                            status: 'success',
                            token: token
                        });
                    } else {
                        res.status(200).json({
                            status: 'error',
                            error: 'User not found in database'
                        })
                    }
             });
        } else {
            res.status(200).json({
                status: 'error',
                error: 'Not a valid token'
            })
        }
    });
  }
  
