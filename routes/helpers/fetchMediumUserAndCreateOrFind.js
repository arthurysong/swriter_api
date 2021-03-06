const request = require('request');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const Note = require('../../models/Note');
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
                            // user.notebooks.push(notebook._id);
                            // await user.save();

                            Note.create({ title: "How to Format your Medium Post", content: "![Add an image for the cover if you want](https://i.imgur.com/wvKui33.gif)\n\n# Title\n\n## Subtitle\n\n[Check out the published post on Medium for comparison.](https://medium.com/p/d9ff9bcdd5e1/edit) \n\nhttps://medium.com/@atribecalledarty/how-to-format-your-medium-post-d9ff9bcdd5e1\n\n\\\nThe **first header 1** of the note becomes the **title** of the post on Medium. The next **header 2** of the note becomes the **subtitle** of the post.\n\n\\\n*NOTE: If you want a subtitle you need to have a title. You must use the exact header type (H1 and H2) for the title and subtitle.*\n\n# Header 1\n\n## Header 2\n\n### Header 3\n\nAny other **Header 1** headers in the note become Header 1's in the post. Any other **Header 2 and Header 3** headers become Header 2's in the post.\n\n## Code Snippets\n\nAny code blocks will be imported as a GitHub gist in the Medium article.\n\n```javascript\n\nconst x = 2;\n\nfunction add (x, y) {\nreturn x + y;\n}\n\nadd(x, 1000);\n```\n\n# Important\n\nPlease do not leave more than one line break at a time. Only leave at most one empty line between content, or else when you publish there will be unwanted ‘/’ characters in your post. This bug is currently being worked on.", owner: user, notebook }, async (err, note) => {
                                notebook.notes.push(note._id);

                                user.notebooks.push(notebook._id);
                                user.lastSavedNote = note._id;

                                await user.save();
                                await notebook.save();

                                const populatedUser = await user
                                    .populate({
                                        path: 'notebooks',
                                        populate: {
                                            path: 'notes',
                                            model: 'Note'
                                        }
                                    })
                                    .populate('lastSavedNote')
                                    .execPopulate();
                                res({ new_access_token: accessToken, refresh_token: refreshToken, user: populatedUser });
                            })
                        })
                    })

                } else {
                    // console.log('result', result);
                    let populatedUser = await result
                        .populate({
                            path: 'notebooks',
                            populate: {
                                path: 'notes',
                                model: 'Note'
                            }
                        })
                        .populate('lastSavedNote')
                        .execPopulate();
                    res({ new_access_token: accessToken, refresh_token: refreshToken, user: populatedUser });
                }
            })
        }
    })
})


module.exports = fetchMediumUserAndCreateOrFind