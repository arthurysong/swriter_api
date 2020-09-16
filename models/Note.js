const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "Untitled"
    }, 
    date: {
        type: Date,
        default: Date.now
    }, 
    content: {
        type: String
    },
    published: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User"
    },
    notebook: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "Notebook"
    }
})

module.exports = mongoose.model("Note", NoteSchema);