// mailer.pb.js
// Handles all email sending logic using Resend API

const { emailLayout } = require("./templates/layout.js");
const { contactAdmin } = require("./templates/contact-admin.js");
const { contactUserEn } = require("./templates/contact-user.en.js");
const { contactUserEs } = require("./templates/contact-user.es.js");

const sendEmail = (to, subject, html, replyTo) => {
  const payload = {
    from: config.fromEmail,
    to: [to],
    subject: subject,
    html: html,
  };

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const res = $http.send({
    url: "https://api.resend.com/emails",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.statusCode !== 200) {
    throw new Error(`Resend error: ${res.statusCode} - ${res.raw}`);
  }

  return res;
};

const sendContactEmails = (name, email, phone, message, lang) => {
  const adminEmail = config.adminEmail;

  // 1. Notify admin (always in Spanish)
  const adminHtml = emailLayout(contactAdmin(name, email, phone, message), "es");
  sendEmail(
    adminEmail,
    `Nuevo mensaje de ${name}`,
    adminHtml,
    email // reply-to goes to the user
  );

  // 2. Confirm to user (in their language)
  const userContent = lang === "es" ? contactUserEs(name) : contactUserEn(name);
  const userSubject = lang === "es" ? "Recibimos tu mensaje" : "We received your message";
  const userHtml = emailLayout(userContent, lang);
  sendEmail(email, userSubject, userHtml);
};
