 
const express = require("express");
const router = express.Router();

const User = require('../models/User');
const Notebook = require('../models/Notebook');
const fetchMediumUserAndCreateOrFind = require('./helpers/fetchMediumUserAndCreateOrFind');
const fetchAccessToken = require('./helpers/fetchAccessToken');
const fetchMediumPublications = require('./helpers/fetchMediumPublications');

router.get("/:id", (req,res) => {

    User.findOne({_id: req.params.id})
        .populate({
            path: 'notebooks',
            populate: {
                path: 'notes',
                model: 'Note'
            }
        })
        .exec((err, user) => {
            if (!user) return res.status(404).json({ errors: "User with given id not found" });
            res.status(200).json(user);
        })
})

router.get("/", (req, res) => {
    User.find({})
    .populate({
        path: 'notebooks',
            populate: {
                path: 'notes',
                model: 'Note'
            }
    })
    .exec((err, users) => {
        res.status(200).json(users);
    })
})

router.post("/:id/lastSavedNotebook", async (req, res) => {
    const result = await User.updateOne({_id: req.params.id}, {lastSavedNotebook: req.body.lastSavedNotebook });
    res.status(200).send(result);
})

router.post("/:id/lastSavedNote", async (req, res) => {
    const result = await User.updateOne({_id: req.params.id}, {lastSavedNote: req.body.lastSavedNote });
    res.status(200).send(result);
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

// TODO: Change the rest of these routes to use better routes (GET and more descriptive routing)
// TODO: put access_token and refresh_token in headers instead of body
// TODO: Use controllers instead of putting all the logic in here?

router.post('/medium', async (req, res) => {
    const { access_token, refresh_token } = req.body
    const { user, new_access_token } = await fetchMediumUserAndCreateOrFind(access_token, refresh_token);
    return res.status(200).json({ user, access_token: new_access_token })
})

// TODO: Change this to /medium/oauth?
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
    // console.log("new access token", new_access_token);
    return res.status(200).json({ user, access_token: new_access_token, refresh_token })
});

router.get("/medium/:mediumId/publications", async (req, res) => {
    const { access_token, refresh_token } = req.headers;
    // const { access_token, refresh_token, mediumId } = req.body;
    // I need the userId... so that I can make the correct REST call.

    const { publications, new_access_token } = await fetchMediumPublications(access_token, refresh_token, req.params.mediumId);
    return res.status(200).json({ publications, access_token: new_access_token, refresh_token })
})

router.post('/github-oauth', async (req, res) => {
    const { state, code } = req.body.queryObject;
    if (state !== process.env.GITHUB_STATE) {
        return res.status(403).json({ errors: "Provided State is invalid" })
    }

    const { access_token, refresh_token } = await fetchAccessToken(code);
    console.log("access_token", access_token, "refresh_token", refresh_token);
})
module.exports = router