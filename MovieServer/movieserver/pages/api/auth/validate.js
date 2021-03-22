const validateUser = require('../../../lib/validateUser');


export default async function handle(req, res) {
    let user = validateUser(req.query.token);
    let username = '';
    console.log(req.body.token);


    if (user !== false) {
        username = user.username;
        console.log(`${username} got a valid access token.`);
    }
    res.status(200).json({
        valid: user !== false,
        username: username
    });
};