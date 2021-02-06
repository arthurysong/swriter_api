const express = require("express");
const cors = require('cors');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

require('dotenv').config();

const users = require('./routes/users');
const notes = require('./routes/notes');
const notebooks = require('./routes/notebooks');
const auth = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://www.mwriter.app"]
}));

app.post('/image', upload.single('file'), (req, res) => {
  res.status(201).send(req.file);
})

app.use(express.static('uploads'));
app.use('/users', users);
app.use('/notes', notes);
app.use('/notebooks', notebooks);
app.use('/auth', auth)

module.exports = app;

// const port = process.env.PORT || 5000;

// app.listen(port, () => console.log(`Server up and running on port ${port}!`));