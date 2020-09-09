const express = require("express");
const cors = require('cors');

require('dotenv').config();

const users = require('./routes/users');
const notes = require('./routes/notes');
const notebooks = require('./routes/notebooks');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/users', users);
app.use('/notes', notes);
app.use('/notebooks', notebooks);

module.exports = app;

// const port = process.env.PORT || 5000;

// app.listen(port, () => console.log(`Server up and running on port ${port}!`));