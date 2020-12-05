const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');

const Note = require('../models/Note');
const Notebook = require('../models/Notebook');
const User = require('../models/User');

const publishPost = require('./helpers/publishPost');
const createGist = require('./helpers/createGist');

router.post("/", (req, res) => {
    if (!req.body.owner) return res.status(400).json({ errors: "Must provide owner id"})
    if (!req.body.notebook) return res.status(400).json({ errors: "Must provide notebook id"})
    Note.create(req.body, (err, note) => {
        Notebook.findOne({ _id: req.body.notebook }, async (err, notebook) => {
            notebook.notes.push(note._id);
            await notebook.save();
            return res.status(201).json(note);
        })
    })
})

// TODO: add the other extensions for different languages available.
const extHash = { "javascript": ".js", "ruby": ".rb" }
router.post("/:id/publish", async (req, res) => {
    let n = await Note.findOne({ _id: req.params.id })
    let u = await User.findOne({ _id: n.owner })
    const { tags, publication } = req.body;
    const { access_token, refresh_token } = req.headers;

    // If note has already been published, then nothing happens...
    if (n.published) {
        return res.status(400).json({ errors: "Note has already been published" })
    
    
    } else {
        // console.log("allo??");
        const contentArray = n.content.split('```');

        for (i = 0; i < contentArray.length; i++) {
            if (i % 2 != 0) {
                let lines = contentArray[i].split('\n').slice(0, -1);
                const language = lines[0];
                const gistName = `${uuid()}.${extHash[language]}`
                const gistContent = lines.slice(1).join('\n');
                const response = await createGist(`Gists for ${n.title}`, { gistName, gistContent })
                contentArray[i] = response.html_url;
            }
        }
        const contentWithPublishedGists = contentArray.join('');
        // console.log(contentArray);
        // console.log("publication", publication);
        try {
            let r = await publishPost(access_token, refresh_token, u.mediumId, n, contentWithPublishedGists, tags, publication)
            return res.status(201).json(r);
        } catch (e) {
            return res.status(400).json(e);
        }
    }
})

router.put("/:id", async (req, res) => {
    const note = await Note.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    // TODO: Also here update the owners lastSavedNote

    const owner = await User.findOneAndUpdate({ _id: note.owner }, { lastSavedNote: note._id });
    return res.status(200).json({ message: "Note successfully saved", note })
})

router.get("/", async (req, res) => {
    const notes = await Note.find({});

    return res.status(200).json(notes);
})

router.delete("/:id", async (req, res) => {
    await Note.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: "Note successfully deleted" })
})

module.exports = router;