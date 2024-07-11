const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// won't define password and user in schema
userSchema.plugin(passportLocalMongoose)
// instead as a plugin
module.exports = mongoose.model('User', userSchema)