const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    number_pattern: {
        type: String,
        required: false
    },
    is_confirmed: {
        type: Boolean,
        required: true
    },
    confirmation:[
        {
            token:{
            type:String,
            required: true
            },
            date:{
                type:Date,
                default: Date.now
            }

        }
    ],
    resetPassword: [{
        token: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }

    }],

})

module.exports = mongoose.model('User', userSchema);