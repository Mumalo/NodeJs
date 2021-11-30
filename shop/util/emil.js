
const nodemailer = require('nodemailer');
/*
const sendgridTransport = require('nodemailer-sendgrid-transport')

 */

/*
const transporter = nodemailer.createTransport(sendgridTransport({
    api_key: 'key' //I dont have a send grid acc
}))

 */


/*
const sendEmailWithSendGrid = (data) => {
    return transporter.sendMail(data)
}

 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ticha.mumaj@gmail.com',
        pass: '8g5K32Vx5z'
    }
})

/*
const sendEmail = (templateParams) => {
    return send(
        "60c1ca5dfb27326b1063a8725d512447",
        "template_ycsjq64",
        templateParams
    );
}
 */

const sendEmail = (options) => {
    return transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
// exports.sendEmailWithSendGrid = sendEmailWithSendGrid;
exports.sendEmail = sendEmail;

//I will use emailJs here since I have have a free account without hassles
