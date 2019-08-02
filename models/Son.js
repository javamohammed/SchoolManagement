const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Son = new Schema({
    idSchool : {
        type: Schema.Types.ObjectId,
        required: true
    },
    idParent: {
        type: Schema.Types.ObjectId,
        required: true
    },
    idStudent: {
        type: Schema.Types.ObjectId,
        required: true
    },
    parent_name: {
        type: String,
        required: true
    },
    student_name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 100,
        required: true
    },
    payed: {
        type: Boolean,
        default: false,
        required: true
    }
})

module.exports = mongoose.model('Son', Son )