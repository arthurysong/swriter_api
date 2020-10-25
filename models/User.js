const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // email: {
    //     type: String,
    //     required: true
    // },
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    mediumId: {
        type: String
    },
    githubId: {
        type: String
    },
    notebooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notebook"
    }]
})

UserSchema.set('timestamps', true);

module.exports = mongoose.model("User", UserSchema);