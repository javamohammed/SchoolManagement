const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Affected = new Schema({
    idSchool : {
        type: Schema.Types.ObjectId,
        required: true
    },
    idTeacher: {
        type: Schema.Types.ObjectId,
        required: true
    },
    idStudent: {
        type: Schema.Types.ObjectId,
        required: true
    },
    teacher_name: {
        type: String,
        required: true
    },
    student_name: {
        type: String,
        required: true
    },
    subject_label: {
        type: String,
        required: true
    },
    note: {
        type: Number,
        default: 0,
        required: false
    }
})

module.exports = mongoose.model('Affected', Affected )