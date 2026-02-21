// mailer.pb.js
// Handles all email sending logic through PocketBase SMTP mail settings
// Template functions (emailLayout, contactAdmin, contactUserEn, contactUserEs)
// are defined globally in templates.pb.js (auto-loaded by PocketBase)

const getSender = () => {
  const settings = $app.settings();
  const meta = settings && settings.meta ? settings.meta : {};
  const senderAddress = config.fromEmail || meta.senderAddress;
  const senderName = config.fromName || meta.senderName || "";

  if (!senderAddress) {
    throw new Error(
      "Missing sender email. Configure Settings > Mail settings or set MAIL_FROM."
    );
  }

  const sender = { address: senderAddress };
  if (senderName) {
    sender.name = senderName;
  }
  return sender;
};

const stripHtml = (html) => {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const sendEmail = (to, subject, html, replyTo, text) => {
  const payload = {
    from: getSender(),
    to: [{ address: to }],
    subject: subject,
    html: html,
    text: text || stripHtml(html),
  };

  if (replyTo) {
    payload.replyTo = [{ address: replyTo }];
  }

  const message = new MailerMessage(payload);
  $app.newMailClient().send(message);
};

const sendContactEmails = (name, email, phone, message, lang) => {
  const adminEmail = config.adminEmail;
  if (!adminEmail) {
    throw new Error("Missing MAIL_ADMIN environment variable.");
  }

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

const sendCustomEmail = (to, subject, html, text, replyTo) => {
  sendEmail(to, subject, html, replyTo, text);
};
