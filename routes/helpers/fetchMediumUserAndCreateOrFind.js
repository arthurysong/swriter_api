const request = require('request');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');

const fetchMediumUserAndCreateOrFind = (accessToken, refreshToken) => new Promise((res, err) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
    }

    request.get('https://api.medium.com/v1/me', { headers }, (err, response, body) => {
        console.log(body);
        if (JSON.parse(body).errors) {
            // if access_token is expired.
            // get new access_token with refresh_token.
            const form = {
                refresh_token: refreshToken,
                client_id: process.env.MEDIUM_CLIENTID,
                client_secret: process.env.MEDIUM_CLIENTPW,
                grant_type: 'refresh_token'
            }

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8'
            }
        
            // Using auth code, get access_token and refresh_token
            request.post('https://api.medium.com/v1/tokens', { form, headers }, (err, response, body) => {
                // console.log("allo??")
                // console.log('refreshToken', refreshToken)
                // console.log(body);
                const { access_token } = JSON.parse(body);

                //try again.
                fetchMediumUserAndCreateOrFind(access_token, refreshToken).then(result => res(result));
            })
        } else {
            const { name, username } = JSON.parse(body).data;
            // console.log('name', name, 'username', username);
            User.findOne({ username }, (err, result) => {
                // console.log('result', result);
                if (!result) {
                    User.create({ name, username }, (err, user) => {
                        // console.log("err", err);
                        // console.log("User", user);
                        Notebook.create({ name: "First Notebook", owner: user }, (err, notebook) => {
                            user.notebooks.push(notebook._id);
                            user.save((err, user) => {
                                // console.log('saved user', user);
                                res({ access_token: accessToken, refresh_token: refreshToken, user });
                                // return user
                                // return res.status(201).json({ access_token: accessToken, refresh_token: refreshToken, user });
                            })
                        })
                    }) 
                        // return res.status(200).json({ access_token: accessToken, refresh_token: refreshToken, name, username, notebooks: small.notebooks })
                    // })
                } else {
                    // console.log('result', result);
                    res({ access_token: accessToken, refresh_token: refreshToken, user: result});
                    // return result
                    // return res.status(200).json({ access_token: accessToken, refresh_token: refreshToken, name, username, notebooks: result.notebooks })
                }
            })
        }
    })
})


module.exports = fetchMediumUserAndCreateOrFind