const request = require('request');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const fetchAccessTokenUsingRefreshToken = require('./fetchAccessTokenUsingRefreshToken');
const fetchContributorsForPublication = require('./fetchContributorsForPublication');

const fetchMediumPublications = (accessToken, refreshToken, mediumId) => new Promise((res, err) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
    }

    request.get(`https://api.medium.com/v1/users/${mediumId}/publications`, { headers }, async (err, response, body) => {
        // console.log(body);
        if (JSON.parse(body).errors) {
            // if access_token is expired.
            // get new access_token with refresh_token, and recall with new accessToken
            let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
            fetchMediumPublications(newAccessToken, refreshToken, mediumId).then(r => res(r));
        } else {
            // Need to return new_access_token, in case the token was refreshed
            const publicationsWhereUserIsContributor = [];
            const publications = JSON.parse(body).data;
            for (const pub of publications) {
              const { contributors } = await fetchContributorsForPublication(accessToken, refreshToken, pub.id);

              if (contributors.some(c => c.userId === mediumId)) {
                publicationsWhereUserIsContributor.push(pub);
              }
            }
            res({ new_access_token: accessToken, publications: publicationsWhereUserIsContributor });
        }
    })
})


module.exports = fetchMediumPublications