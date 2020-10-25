const mongoose = require("mongoose");

const NotebookSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Untitled"
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

NotebookSchema.set('timestamps', true);

module.exports = mongoose.model("Notebook", NotebookSchema);
