const request = require('request');
const Note = require('../../models/Note');
const fetchAccessTokenUsingRefreshToken = require('../helpers/fetchAccessTokenUsingRefreshToken');
require('dotenv').config();

function publishPost(accessToken, refreshToken, userMediumId, note, content, tags, publication) {
    return new Promise((res, rej) => {
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
            publishStatus: "public",
            tags
        }

        console.log("hi");

        // If there is a publication, publish under that publication
        if (publication) {
            // publish post under publication
            request.post(`https://api.medium.com/v1/publications/${publication}/posts`, { headers, form: postData }, async (err, response, body) => {
                console.log(JSON.parse(body));
                const { errors } = JSON.parse(body);
                if (errors) {
                    if (errors[0].code === 2002) return rej(errors[0]);
                    let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
                    publishPost(newAccessToken, refreshToken, userMediumId, note, content, tags, publication).then(r => res(r));
                } else {
                    let n = await Note.findOne({ _id: note._id });
                    n.published = true;
                    n.mediumURL = JSON.parse(body).data.url;
                    await n.save();
                    // console.log("note", n);
                    // this should return the url and title??
                    res({ success: true, note: n });
                }
            })

        // If no publication, publish under just self
        } else {
            request.post(`https://api.medium.com/v1/users/${userMediumId}/posts`, { headers, form: postData }, async (err, response, body) => {
                console.log(JSON.parse(body));
                const { errors } = JSON.parse(body);
                if (errors) {
                    console.log("errors", errors);
                    // What is code -1...?
                    if (errors[0].code === 2002 || errors[0].code === -1) return rej(errors[0]);

                    // Only retry if code is authenticatino code error
                    let newAccessToken = await fetchAccessTokenUsingRefreshToken(refreshToken);
                    publishPost(newAccessToken, refreshToken, userMediumId, note, content, tags, publication).then(r => res(r));
                } else {
                    let n = await Note.findOne({ _id: note._id });
                    n.published = true;
                    n.mediumURL = JSON.parse(body).data.url;
                    await n.save();
                    // console.log("note", n);
                    res({ success: true, note: n });
                }
            })
        }
    })
}

module.exports = publishPost;