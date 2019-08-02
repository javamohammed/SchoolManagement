const nodemailer = require('nodemailer');
const User = require('../models/user')

const transport = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    auth: {
        user: process.env.MAIL_TRAP_USER,
        pass: process.env.MAIL_TRAP_PASSWORD
    }
});
exports.Send = options => transport.sendMail(options)

exports.EncodeBase64 = data => {
    let buff = new Buffer(data);
    return buff.toString('base64');
}
exports.DecodeBase64 = data => {
    let buff = new Buffer(data, 'base64');
    return buff.toString('ascii');
}

exports.Schools =  () => {
return User.find({}).then( users => {
        let Schools = [];
           return users.map(user => {
              return Schools[user._id.toString()] = {
                   name: user.name,
                   id: user._id.toString()
               };
            })

    })
}