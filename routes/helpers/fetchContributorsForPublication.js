const request = require('request');
const fetchAccessTokenUsingRefreshToken = require('./fetchAccessTokenUsingRefreshToken')

const fetchContributorsForPublication = (accessToken, refreshToken, publicationId) => new Promise((res, err) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
    }

    request.get(`https://api.medium.com/v1/publications/${publicationId}/contributors`, { headers }, async (err, response, body) => {
        // console.log(body);
        // console.log(accessToken);
        // console.log(refreshToken);
        if (JSON.parse(body).errors) {
          
            // if access_token is expired.
            // get new access_token with refresh_token, and recall with new accessToken
            let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
            fetchContributorsForPublication(newAccessToken, refreshToken, publicationId).then(r => res(r));
        } else {
            // console.log(JSON.parse(body).data);
            // Need to return new_access_token, in case the token was refreshed
            // console.log()
            const contributors = JSON.parse(body).data;

            // publications.forEach(async pub => {
              
            // })
            res({ contributors });
            // TODO: For each publication, I need to get the contributors and see if I'm on there
        }
    })
})


module.exports = fetchContributorsForPublication