const nodemailer = require('nodemailer')

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })
        let info = transporter.sendMail({
            from: {
                name: 'Password Support',
                address: process.env.MAIL_USER,
            },
            to: email,
            subject: title,
            html: body,
        })
        console.log('email info from services: ', info)
        return info;
    } catch (error) {
        console.log("errror in service: ", error)
    }
}

module.exports = mailSender