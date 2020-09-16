const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const Notebook = require('../models/Notebook');
const User = require('../models/User');

const publishPost = require('./helpers/publishPost');

router.post("/", (req, res) => {
    if (!req.body.owner) return res.status(400).json({ errors: "Must provide owner id"})
    if (!req.body.notebook) return res.status(400).json({ errors: "Must provide notebook id"})
    Note.create(req.body, (err, note) => {
        Notebook.findOne({ _id: req.body.notebook }, async (err, notebook) => {
            notebook.notes.push(note._id);
            await notebook.save();
            return res.status(201).json(note);
        })
    })
})

router.post("/:id/publish", async (req, res) => {
    // find the note
    // send request to Medium API.
    // if API call is successful, update the published attr for the note
    // Also, we need access token?
    console.log("Allo??");
    let n = await Note.findOne({ _id: req.params.id })
    let u = await User.findOne({ _id: n.owner })
    if (n.published) {
        return res.status(400).json({ errors: "Note has already been published" })
    } else {
        let r = await publishPost(req.body.access_token, req.body.refresh_token, u.mediumId, n)
        console.log("r", r);
        return res.status(201).json(r);
    }
})

router.put("/:id", async (req, res) => {
    const note = await Note.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    // console.log("note after update", note);
    return res.status(200).json({ message: "Note successfully saved", note })
})

module.exports = router;