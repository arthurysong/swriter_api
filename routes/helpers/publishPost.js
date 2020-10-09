const request = require('request');
const Note = require('../../models/Note');
const fetchAccessTokenUsingRefreshToken = require('../helpers/fetchAccessTokenUsingRefreshToken');
require('dotenv').config();

function publishPost(accessToken, refreshToken, userMediumId, note, content) {
    return new Promise((res, err) => {
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }

        const postData = {
            title: note.title,
            contentFormat: "markdown",
            content: content,
            publishStatus: "public"
        }

        console.log(userMediumId);
        console.log(postData);
        request.post(`https://api.medium.com/v1/users/${userMediumId}/posts`, { headers, form: postData }, async (err, response, body) => {
            // console.log(err);
            // console.log()
            console.log(JSON.parse(body));
            if (JSON.parse(body).errors) {
                let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
                publishPost(newAccessToken, refreshToken, userMediumId, note, content).then(r => res(r));
            } else {
                let n = await Note.findOne({ _id: note._id });
                n.published = true;
                n.mediumURL = JSON.parse(body).data.url;
                await n.save();
                // console.log("note", n);
                res({ success: true, note: n });
            }
        })
    })
}

module.exports = publishPost;