const sgMail = require('@sendgrid/mail');
const sendgripAPIKey = process.env.SENDGRIP_API_KEY;

sgMail.setApiKey(sendgripAPIKey);


const sendWellcomeEmail = (email, name) => {
    return sgMail.send({
        to: email,
        from: 'anton.voron.gt@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Wellcome to the app, ${name}. Let me know how get along with app.`,
    })
};

const sendCancelationEmail = (email, name) => {
    return sgMail.send({
        to: email,
        from: 'anton.voron.gt@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. Hope to see you back sometime soon. Your account was deleted successfuly`
    })
}


module.exports = {
    sendWellcomeEmail,
    sendCancelationEmail
}