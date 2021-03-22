import cookie from 'js-cookie';

const getServerToken = async (server, mainToken) => {
    return new Promise(async (resolve, reject) => {
        fetch(`${server.server_ip}/api/auth/getNewToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: mainToken
            })
        })
        .then((r) => r.json())
        .then((data) => {
            if (data.status === 'success') {
                resolve(data.token);
            } else {
                reject();
            }
        });
    });
}

// Check if user have access to this server
const validateServerAccess = async (server, cb) => {
    let mainToken = cookie.get('token');
    let serverToken = cookie.get('serverToken');

    // If we haven't saved a serverToken, try to get one
    if (serverToken == null || serverToken == undefined) {
        getServerToken(server, mainToken)
        .then((token) => {
            console.log("GOT NEW TOKEN");
            cookie.set('serverToken', token);
            cb();
        })
        .catch(err => {
            // redirect home, mainToken not valid or we couldn't get a serverToken for some reason
            Router.push(`/`);
            console.log(err);
        });
    } else {
        // If we have saved a serverToken, check if it's valid
        return await fetch(`${server.server_ip}/api/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: serverToken
            }),
        })
        .then((r) => r.json())
        .then((data) => {
            // If the token was valid
            if (data.status === 'success') {
                cb();
            } else {
                // If the token wasn't valid try to get a new one
                getServerToken(server, mainToken)
                .then((token) => {
                    cookie.set('serverToken', token);
                    cb();
                })
                .catch(err => {
                    // redirect home, mainToken not valid or we couldn't get a serverToken for some reason
                    Router.push(`/`);
                    console.log(err);
                });
            }
        });
    }
}

module.exports = validateServerAccess;