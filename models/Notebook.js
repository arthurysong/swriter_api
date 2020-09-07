const mongoose = require("mongoose");

const NotebookSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Untitled"
    },
    date: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})