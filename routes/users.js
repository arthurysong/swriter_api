 
const express = require("express");
const router = express.Router();
const axios = require('axios');

router.get("/authenticate", (req, res) => {
    console.log(process.env.MEDIUM_CLIENTID)
})

module.exports = router