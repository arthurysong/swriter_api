const express = require('express');
const router = express.Router();

const Notebook = require('../models/Notebook');

router.get("/", (req,res) => {
    Notebook.find((err,arr) => {
        res.status(200).json(arr);
    })
    // res.status(200).json()
})

router.post("/", (req,res) => {

})

module.exports = router;