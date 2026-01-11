const mongoose = require('mongoose')

const user = new mongoose.Schema({
    email: {
        type: String,
        require: true,
    },
    shareId: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    avatar: {
        type: Object,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    isGuest: {
        type: Boolean
    },
    session: {
        type: Object,
        require: true,
    },


    filse: {
        type: Array,
    },
    filseStorySend: {
        type: Array,
    },
    filseStoryGet: {
        type: Array,
    },


    verificationCode: {
        type: String
    },
    codeExpires:  {
        type: String
    },
    isVerified: {
        type: Boolean
    },
    emailNew: {
        type: String
    },


    expirationTime: {
        type: String
    },


    isDelete: {
        type: Boolean
    },
    accountDeleteExpirationTime: {
        type: String
    },

})

module.exports = mongoose.model("User", user);