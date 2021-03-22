const hash = require('../auth/hash');
const db = require('../../../lib/db').default;
const jwt = require('jsonwebtoken');

export default async function handle(req, res) {
    let token = req.body.token;
    let refreshToken = req.body.refreshToken;

    let user = hash.decodeJWT(token, true);

    // Access token does not exist
    console.log("user:");
    console.log(user);
    if (!user) {
        res.status(200).json({
            status: 'fail',
            message: 'No match'
        });
        return;
    }

    let encryptedToken = hash.getHashWithoutSalt(token);
    let encryptedRefreshToken = hash.getHashWithoutSalt(refreshToken);

    db.one('SELECT COUNT(*) FROM user_access_token WHERE user_id = $1 AND access_token = $2 AND refresh_token = $3', [user.userId, encryptedToken, encryptedRefreshToken]).then(result => {
        if (parseInt(result.count) === 1) {
            db.none('DELETE FROM user_access_token WHERE user_id = $1 AND access_token = $2 AND refresh_token = $3', [user.userId, encryptedToken, encryptedRefreshToken]).then(result => {
                let newToken = jwt.sign(
                    {
                        userId: user.userId,
                        email: user.email,
                        username: user.username
                    },
                    hash.getJWTSecret(),
                    {
                        expiresIn: 3600, // 1h
                    },
                );


                refreshToken = hash.generateRefreshToken();
                encryptedToken = hash.getHashWithoutSalt(newToken);
                encryptedRefreshToken = hash.getHashWithoutSalt(refreshToken);
                    
                db.none('INSERT into user_access_token (user_id, access_token, refresh_token) VALUES($1, $2, $3)',[user.userId, encryptedToken, encryptedRefreshToken]).then(() => {
                    res.status(200).json({
                        status: 'success',
                        message: 'success',
                        token: newToken,
                        refreshToken: refreshToken
                    });
                    console.log("REFRESHED TOKEN");
                });
            });
        } else {
            // Pair between access token and refresh token does not exist
            res.status(200).json({
                status: 'fail',
                message: 'No match'
            })
        }
    }).catch(err => {
        // Db error
        console.log(err);
        res.status(200).json({
            status: 'fail',
            message: 'DB error'
        })
    });
};