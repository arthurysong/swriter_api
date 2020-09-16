const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const Notebook = require('../models/Notebook');
const User = require('../models/User');

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

router.post("/:id/publish", (req, res) => {
    // find the note
    // send request to Medium API.
    // if API call is successful, update the published attr for the note
    // Also, we need access token?
})

router.put("/:id", async (req, res) => {
    const note = await Note.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    // console.log("note after update", note);
    return res.status(200).json({ message: "Note successfully saved", note })
})

module.exports = router;