const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

require('dotenv').config();

const users = require('./routes/users');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

app.use('/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));