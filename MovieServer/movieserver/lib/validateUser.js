const jwt = require('jsonwebtoken');

function validateUser(token, ignoreExpiry=false) {
    let decoded;
    if (token === undefined || token === null) {
        return false;
    }

    try {
        decoded = jwt.verify(token, process.env.SECRET, {
            ignoreExpiration: ignoreExpiry
        });
        return decoded;
    } catch (e) {
        return false;
    }

}

module.exports = validateUser;