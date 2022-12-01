const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

    longUrl: {
        type: String,
        required: true,
        unique: true
    },

    shortUrl: {
        type: String,
        required: true,
        unique: true
    },

    urlCode: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    }

})

module.exports = mongoose.model('ShortUrl', urlSchema)