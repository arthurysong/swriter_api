 
const express = require("express");
const router = express.Router();
const secureRandom = require('secure-random');


const User = require('../models/User');
// var querystring = require('querystring');
// var http = require('http');
var request = require('request');
// var fs = require('fs');

router.get("/authenticate", (req, res) => {
    console.log(process.env.MEDIUM_CLIENTID)
})

router.post('/', (req, res) => {
    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        
    })
})

router.post('/medium-oauth', (req, res) => {
    // console.log(req.body);
    const { state, code } = req.body.queryObject

    // if provided state is invalid return error, this is going to be authentication for our resources.
    if (state !== process.env.MEDIUM_STATE) {
        return res.status(403).json({ errors: "Provided State is invalid" })
    }

    var post_data = {
        code: code,
        client_id: process.env.MEDIUM_CLIENTID,
        client_secret: process.env.MEDIUM_CLIENTPW,
        grant_type: 'authorization_code',
        redirect_uri: 'http://127.0.0.1:3000/client'
    }

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
    }

    // Using auth code, get access_token and refresh_token
    request.post('https://api.medium.com/v1/tokens', { form: post_data, headers }, (err, response, body) => {
        // console.log(body);
        const { errors, access_token, refresh_token } = JSON.parse(body)

        if (errors) {
            return res.status(403).json({ errors })
        }

        headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
        }

        // Get user profile from medium and find or create new user.
        request.get('https://api.medium.com/v1/me', { headers }, (err, response, body) => {
            const { name, username } = JSON.parse(body).data;
            User.findOne({ username: username }, (err, result) => {
                if (!result) {
                    User.create({ username, name }, (err, small) => {
                        return res.status(200).json({ access_token, refresh_token, name, username, notebooks: small.notebooks })
                    })
                } else {
                    return res.status(200).json({ access_token, refresh_token, name, username, notebooks: result.notebooks })
                }
            })
        })
    })
});

module.exports = router