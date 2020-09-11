 
const express = require("express");
const router = express.Router();

const User = require('../models/User');
const Notebook = require('../models/Notebook');
const fetchMediumUserAndCreateOrFind = require('./helpers/fetchMediumUserAndCreateOrFind');
const fetchAccessToken = require('./helpers/fetchAccessToken');
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

router.post('/medium', async (req, res) => {
    const { access_token, refresh_token } = req.body
    const { user, new_access_token } = await fetchMediumUserAndCreateOrFind(access_token, refresh_token);
    return res.status(200).json({ user, access_token: new_access_token })
})

router.post('/medium-oauth', async (req, res) => {
    // console.log(req.body);
    const { state, code } = req.body.queryObject

    // if provided state is invalid return error, this is going to be authentication for our resources.
    if (state !== process.env.MEDIUM_STATE) {
        return res.status(403).json({ errors: "Provided State is invalid" })
    }

    const { access_token, refresh_token } = await fetchAccessToken(code)
        .catch(err => res.status(403).json(err));
    if (res.status === 403) return res;
    
    const { user, new_access_token } = await fetchMediumUserAndCreateOrFind(access_token, refresh_token)
    // console.log("ALLOOOOOO")
    // console.log("new access token", new_access_token);
    return res.status(200).json({ user, access_token: new_access_token, refresh_token })
});

module.exports = router