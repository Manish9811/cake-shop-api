import nodemailer from "nodemailer";

// Create a transporter using SMTP

export const transporter = nodemailer.createTransport({
  service: "gmail", // ✅ THIS fixes your issue
  auth: {
    user: process.env.GMAIL,
    pass: process.env.APP_PASSWORD,
  },
});


export default async function sendMail(to, subject, text, html) {
try {
  const info = await transporter.sendMail({
    from:  process.env.GMAIL, // sender address
    to: to, // list of recipients
    subject: subject, // subject line
    text: text, // plain text body
    html: html, // HTML body
  });

  return true;
} catch (err) {
  return false;
}
}