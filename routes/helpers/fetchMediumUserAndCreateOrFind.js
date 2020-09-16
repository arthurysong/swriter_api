const request = require('request');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const fetchAccessTokenUsingRefreshToken = require('./fetchAccessTokenUsingRefreshToken')

const fetchMediumUserAndCreateOrFind = (accessToken, refreshToken) => new Promise((res, err) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
    }

    request.get('https://api.medium.com/v1/me', { headers }, async (err, response, body) => {
        // console.log(body);
        if (JSON.parse(body).errors) {
            // if access_token is expired.
            // get new access_token with refresh_token.
            let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
            fetchMediumUserAndCreateOrFind(newAccessToken, refreshToken).then(r => res(r));
        } else {
            const { name, username, id } = JSON.parse(body).data;
            // console.log("id", id);
            // console.log('name', name, 'username', username);
            User.findOne({ username }, async (err, result) => {
                // console.log('result', result);
                if (!result) {
                    User.create({ name, username, mediumId: id }, (err, user) => {
                        // console.log("err", err);
                        // console.log("User", user);
                        Notebook.create({ name: "First Notebook", owner: user }, async (err, notebook) => {
                            // console.log("errors", err);
                            // console.log("notebook", notebook);
                            user.notebooks.push(notebook._id);
                            await user.save();
                            const populatedUser = await user.populate({
                                path: 'notebooks',
                                populate: {
                                    path: 'notes',
                                    model: 'Note'
                                }
                            }).execPopulate();
                            res({ new_access_token: accessToken, refresh_token: refreshToken, user: populatedUser });
                        })
                    })

                } else {
                    // console.log('result', result);
                    let populatedUser = await result.populate({
                        path: 'notebooks',
                        populate: {
                            path: 'notes',
                            model: 'Note'
                        }
                    }).execPopulate();
                    res({ new_access_token: accessToken, refresh_token: refreshToken, user: populatedUser });
                }
            })
        }
    })
})


module.exports = fetchMediumUserAndCreateOrFind