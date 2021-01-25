const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "Untitled"
    }, 
    content: {
        type: String,
        default: `#`
        // default: `#`
    },
    published: {
        type: Boolean,
        default: false
    },
    mediumURL: {
        type: String
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

NoteSchema.set('timestamps', true);

module.exports = mongoose.model("Note", NoteSchema);