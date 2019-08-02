const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchoolSchema = new Schema({
   id_school: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email:{
        type:String,
        required:true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: String,
        required: true
    },
    identity: {
        type: String,
        required: true
    },
    type_doc: {
        type: String,
        required: true
    },
    image_url_doc: {
        type: String,
        required: true
    },
    image_url_avatar: {
        type: String,
        required: false
    },
    type_user_school: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    is_confirmed: {
        type: Boolean,
        required: false
    },
    phone: {
        type: String,
        required: true
    },
     confirmation: [{
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

module.exports = mongoose.model('UserSchool', userSchoolSchema);