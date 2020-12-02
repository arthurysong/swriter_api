const express = require("express");
const cors = require('cors');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

require('dotenv').config();

const users = require('./routes/users');
const notes = require('./routes/notes');
const notebooks = require('./routes/notebooks');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/image', upload.single('file'), (req, res) => {
  res.status(201).send(req.file);
})

app.use(express.static('uploads'));
app.use('/users', users);
app.use('/notes', notes);
app.use('/notebooks', notebooks);

module.exports = app;

// const port = process.env.PORT || 5000;

// app.listen(port, () => console.log(`Server up and running on port ${port}!`));