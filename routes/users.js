 
const express = require("express");
const router = express.Router();

const User = require('../models/User');
const Notebook = require('../models/Notebook');
const { fetchMediumUserAndRenderJSON } = require('./helpers/fetchMediumUserAndRenderJSON');
var request = require('request');

router.get("/", (req,res) => {
    User.find((err, arr) => {
        res.status(200).json(arr);
        // console.log(arr);
    });
})

router.post("/", (req, res) => {
    User.create({ name: req.body.name, username: req.body.username }, (err, user) => {
        // console.log(user);
        Notebook.create({ name: "First Notebook", owner: user }, (err, notebook) => {
            user.notebooks.push(notebook._id);
            user.save((err, user) => {
                // console.log('saved user', user);
                return res.status(201).json(user);
            })
        })
    })
})

router.delete("/:id", (req, res) => {
    User.deleteOne({ _id: req.params.id }, err => {
        console.log(err);
        res.status(200).json({ message: "User has been deleted" })
    })

    Notebook.deleteOne({ owner: req.params.id }, err => {
        console.log(err);
        res.status(200).json({ message: "User has been deleted" })
    })
})

router.get("/authenticate", (req, res) => {
    console.log(process.env.MEDIUM_CLIENTID)
})
router.post('/medium', (req, res) => {
    const { access_token, refresh_token } = req.body
    // Get user profile from medium and find or create new user.
    fetchMediumUserAndRenderJSON(access_token, refresh_token, req, res);
})

router.post('/medium-oauth', (req, res) => {
    // console.log(req.body);
    const { state, code } = req.body.queryObject

    // if provided state is invalid return error, this is going to be authentication for our resources.
    if (state !== process.env.MEDIUM_STATE) {
        return res.status(403).json({ errors: "Provided State is invalid" })
    }

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

    // Using auth code, get access_token and refresh_token
    request.post('https://api.medium.com/v1/tokens', { form: post_data, headers }, (err, response, body) => {
        const { errors, access_token, refresh_token } = JSON.parse(body)

        if (errors) {
            return res.status(403).json({ errors })
        }

        fetchMediumUserAndRenderJSON(access_token, refresh_token, req, res);
    })
});


module.exports = router