const express = require('express');
const router = express.Router();

const Note = require('../models/Note');

router.post("/", (req, res) => {
    if (!req.body.owner) return res.status(400).json({ errors: "Must provide owner id"})
    if (!req.body.notebook) return res.status(400).json({ errors: "Must provide notebook id"})
    Note.create(req.body, (err, note) => {
        // console.log("errors", err);
        return res.status(201).json(note);
    })
})

module.exports = router;