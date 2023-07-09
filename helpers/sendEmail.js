const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, EMAIL_FROM } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (uEmail, verificationKey) => {
  const email = {
    from: EMAIL_FROM,
    to: uEmail,
    subject: "Verify email",
    html: `<p>Verification code: ${verificationKey}</p>`,
  };
  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;
