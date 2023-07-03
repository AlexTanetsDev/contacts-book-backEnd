const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, BASE_URL, EMAIL_FROM } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (uEmail, token) => {
  const email = {
    from: EMAIL_FROM,
    to: uEmail,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${token}">Click to verify email</a>`,
  };
  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;
