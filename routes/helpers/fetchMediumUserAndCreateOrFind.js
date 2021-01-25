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
                            user.notebooks.push(notebook._id);
                            await user.save();

                            Note.create({ name: "How to Format your Medium Post", content: "![Add an image for the cover if you want](https://mwriter-api.herokuapp.com/0e12ff6777ffb959fac411cef1069950)\n\n# The first H1 is Title\n\n## Next H2 is Subtitle\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper felis vel laoreet aliquet. Mauris vulputate ac nunc a scelerisque. Sed accumsan, sapien eu vestibulum vestibulum, est enim ullamcorper ligula, quis accumsan quam risus vel nisi. Integer id luctus lacus. Vestibulum id diam non massa tincidunt dignissim nec ac urna. Phasellus iaculis pulvinar ultrices. Quisque pulvinar varius dui et rhoncus. Sed augue nisi, molestie vel fringilla quis, eleifend sit amet est. Donec non efficitur neque. Nunc vitae fringilla leo, in ullamcorper tortor. In at nulla sit amet diam rutrum vestibulum. Sed et risus ultricies, dignissim erat sit amet, pellentesque velit.\n\n\\\nVivamus aliquet, nisi et ornare commodo, elit ligula malesuada mauris, at condimentum turpis massa vitae nulla. Donec eu purus eget dolor rhoncus lobortis sed id ipsum. Pellentesque vehicula velit eu auctor egestas. Suspendisse ac odio et sem blandit vulputate sodales convallis ante. Mauris in dapibus ante. Pellentesque id felis nec massa tincidunt mollis et nec odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi ornare, justo ut gravida iaculis, felis eros aliquet arcu, varius malesuada orci ex ut odio. Pellentesque tristique bibendum iaculis. Nam consectetur nibh in arcu rutrum tempor. Proin ac ipsum vitae ipsum laoreet imperdiet. Nam ut tincidunt ipsum. Praesent tempus quam eu dolor tempus, in ornare eros auctor. Curabitur et lacus orci. Mauris ex enim, scelerisque sit amet turpis in, pellentesque congue purus.\n\n\\\n```javascript\n// **any code snippet will get imported as a GitHub gist**\n\nconst x = 2;\n\nfunction add (x, y) {\n  return x + y;\n}\n\nadd(x, 1000);\n```\n\n\\\n", owner: user, notebook }, async (err, note) => {
                                notebook.notes.push(note._id);
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