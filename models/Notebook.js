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
        require: true,
        ref: "User"
    },
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note" 
    }]
})

module.exports = mongoose.model("Notebook", NotebookSchema);
