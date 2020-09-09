const express = require('express');
const router = express.Router();

const Note = require('../models/Note');

router.post("/", (req, res) => {
    Note.create()
    // console.log('hi');
    res.status(200).json({ message: 'hi' })
})

module.exports = router;