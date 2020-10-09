const request = require('request');
const axios = require('axios');

function createGist(description, { gistName, gistContent }) {
    return new Promise((res, err) => {
        const headers = {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'user-agent': 'node.js',
        }

        const data = {
            "files": { 
                [gistName]: {
                    "content": gistContent
                } 
            }
        }

        axios.post('https://api.github.com/gists', data, { headers })
            .then(resp => {
                // console.log(resp.data);
                res(resp.data);
            })
            .catch(err => console.log(err));
    })
}

module.exports = createGist;