const request = require('request');
require('dotenv').config();


function fetchAccessTokenUsingRefreshToken(refreshToken) {
    return new Promise ((res, err) => {
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
    
        request.post('https://api.medium.com/v1/tokens', { form, headers }, (err, response, body) => {
            res(JSON.parse(body).access_token);
        })
    })
}

module.exports = fetchAccessTokenUsingRefreshToken;