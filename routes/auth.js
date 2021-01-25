const express = require("express");
const request = require('request');
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send({ test: "Hi" })
}) 

router.get("/medium", (req, res) => {
  // This is a test route
  const headers = {
    'Authorization': `Bearer ${process.env.MEDIUM_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
}

request.get('https://api.medium.com/v1/me', { headers }, async (err, response, body) => {
  console.log("errors", err);
  console.log("response", response.data);
  console.log("body", JSON.parse(body).errors);
        // const { name, username, id } = JSON.parse(body).data;
        // console.log("id", id);
        // console.log('name', name, 'username', username);
  })
})

module.exports = router;