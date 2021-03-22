const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * hash with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(string, salt){
    var hash = crypto.createHmac('sha512', string); /** Hashing algorithm sha512 */
    var value = hash.digest('hex');
    return value;
}

exports.getHash = sha512;