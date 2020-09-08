 
const express = require("express");
const router = express.Router();

// var querystring = require('querystring');
// var http = require('http');
var request = require('request');
// var fs = require('fs');

router.get("/authenticate", (req, res) => {
    console.log(process.env.MEDIUM_CLIENTID)
})

router.post('/medium', (req, res) => {
    console.log('hi');
    console.log(req.body);
    var post_data = {
        code: req.body.queryObject.code,
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

    request.post('https://api.medium.com/v1/tokens', { form: post_data, headers }, (err, response, body) => {
        console.log(body);
    })
});

module.exports = router