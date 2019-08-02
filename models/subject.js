const mongoose = require('mongoose')

const Schema = mongoose.Schema
const subjectSchema = new  Schema({
    label:{
        type:String,
        required:true
    },
    userId: {
        type: 'ObjectId',
         ref: 'User'
    },
    teachers : [
       {
            teacherId: {
                type: 'ObjectId',
                ref: 'UserSchool',
                required: false
            }
       }
    ]
})

module.exports = mongoose.model('Subject', subjectSchema)