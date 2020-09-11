const request = require('request');

function fetchAccessToken(code) {
    return new Promise ((resolve, error) => {
        const post_data = {
            code: code,
            client_id: process.env.MEDIUM_CLIENTID,
            client_secret: process.env.MEDIUM_CLIENTPW,
            grant_type: 'authorization_code',
            redirect_uri: 'http://127.0.0.1:3000/client'
        }
    
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    
        request.post('https://api.medium.com/v1/tokens', { form: post_data, headers }, async (err, response, body) => {
            const { errors, access_token, refresh_token } = JSON.parse(body)
    
            if (errors) {
                console.log(errors);
                error(errors)
            }

            resolve({ access_token, refresh_token })
        })
    })
}

module.exports = fetchAccessToken;