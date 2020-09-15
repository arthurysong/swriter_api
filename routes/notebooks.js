const express = require('express');
const router = express.Router();

const Notebook = require('../models/Notebook');
const User = require('../models/User');

router.get("/", (req,res) => {
    Notebook.find((err,arr) => {
        res.status(200).json(arr);
    })
    // res.status(200).json()
})

router.post("/", (req, res) => {
    // console.log("Test");
    if (!req.body.owner) return res.status(400).json({ errors: "Notebook's owner id must be provided" })
    if (!req.body.name) return res.status(400).json({ errors: "Notebook's name must be provided" })
    // console.log(req.body);
    Notebook.create({ name: req.body.name, owner: req.body.owner }, (err, notebook) => {
        User.findOne({ _id: req.body.owner } , async (err, user) => {
            user.notebooks.push(notebook._id);
            await user.save();
            return res.status(201).json(notebook);
        })
        // console.log('errors', err);
        // console.log("created notebook", notebook);
        // res.status(201).json(notebook);
    })
})

module.exports = router;