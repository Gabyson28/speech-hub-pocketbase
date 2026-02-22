// templates.pb.js
// Auto-loaded by PocketBase — all functions available globally

// Shared header and footer for all email templates
// lang: "en" | "es"
var emailLayout = (content, lang = "en", websiteUrl = "https://carelimartinezphl.com") => {
  const title = lang === "es" ? "Patóloga del Habla" : "Speech-Language Pathologist";
  const footerNote = lang === "es"
    ? "Este correo fue enviado automáticamente. Por favor no respondas directamente a este mensaje."
    : "This email was sent automatically. Please do not reply directly to this message.";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Careli Martínez Aquino, CCC-SLP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #eef4f5;
      font-family: 'Inter', Arial, sans-serif;
      color: #1e3040;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 28px -14px rgba(30,60,80,0.22), 0 2px 6px -3px rgba(30,60,80,0.12);
    }

    .header {
      background: linear-gradient(135deg, #2a8f6f 0%, #2e9e82 50%, #2b9bb5 100%);
      padding: 36px 40px;
      text-align: center;
    }

    .header-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
      margin-bottom: 4px;
    }

    .header-title {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .content {
      padding: 40px 40px 32px;
    }

    .footer {
      background-color: #f0f6f7;
      border-top: 1px solid #d8e8ea;
      padding: 24px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #6b8a96;
      line-height: 1.6;
      font-family: 'Inter', Arial, sans-serif;
    }

    .footer a {
      color: #2a8f6f;
      text-decoration: none;
      font-weight: 500;
    }

    .footer-divider {
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #2a8f6f, #2b9bb5);
      margin: 12px auto;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <div class="header-name">Careli Martínez Aquino, CCC-SLP</div>
      <div class="header-title">${title}</div>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <div class="footer-divider"></div>
      <p>
        © ${new Date().getFullYear()} Careli Martínez Aquino &nbsp;·&nbsp;
        <a href="${websiteUrl}">${websiteUrl.replace("https://", "")}</a>
      </p>
      <p style="margin-top: 6px;">${footerNote}</p>
    </div>

  </div>
</body>
</html>`;
};

// Admin notification email - when someone submits the contact form
var contactAdmin = (name, email, phone, message) => `
  <style>
    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b8a96;
      margin-bottom: 4px;
      font-family: 'Inter', Arial, sans-serif;
    }

    .value {
      font-size: 15px;
      color: #1e3040;
      margin-bottom: 20px;
      line-height: 1.5;
      font-family: 'Inter', Arial, sans-serif;
    }

    .message-value {
      font-size: 15px;
      color: #1e3040;
      line-height: 1.75;
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f0f6f7;
      border-radius: 8px;
      padding: 16px 20px;
    }

    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      color: #1e3040;
      margin-bottom: 24px;
    }

    .divider {
      border: none;
      border-top: 1px solid #e2ecee;
      margin: 20px 0;
    }
  </style>

  <p class="section-title">New Contact Form Submission</p>

  <div class="label">Name</div>
  <div class="value">${name}</div>

  <div class="label">Email</div>
  <div class="value"><a href="mailto:${email}" style="color:#2a8f6f;text-decoration:none;">${email}</a></div>

  ${phone ? `
  <div class="label">Phone</div>
  <div class="value"><a href="tel:${phone}" style="color:#2a8f6f;text-decoration:none;">${phone}</a></div>
  ` : ''}

  <hr class="divider" />

  <div class="label">Message</div>
  <div class="message-value">${message}</div>
`;

// User confirmation email - English version
var contactUserEn = (name) => `
  <style>
    .greeting {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: #1e3040;
      margin-bottom: 16px;
    }

    .message-body {
      font-size: 15px;
      line-height: 1.75;
      color: #3a5568;
      margin-bottom: 24px;
    }

    .highlight-box {
      background: linear-gradient(145deg, #ffffff, #f0faf7);
      border-left: 4px solid #2a8f6f;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin: 24px 0;
    }

    .highlight-box p {
      font-size: 14px;
      color: #2a6655;
      line-height: 1.6;
    }

    .signature {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e2ecee;
    }

    .signature-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 600;
      color: #1e3040;
    }

    .signature-title {
      font-size: 13px;
      color: #6b8a96;
      margin-top: 2px;
    }
  </style>

  <p class="greeting">Hello, ${name} 👋</p>

  <p class="message-body">
    Thank you for reaching out! I have received your message and will get back to you as soon as possible.
  </p>

  <div class="highlight-box">
    <p>
      I typically respond within <strong>1–2 business days</strong>. If your matter is urgent,
      please feel free to contact me directly through the website.
    </p>
  </div>

  <p class="message-body">
    I appreciate you taking the time to connect, and I look forward to speaking with you soon.
  </p>

  <div class="signature">
    <div class="signature-name">Careli Martínez Aquino, CCC-SLP</div>
    <div class="signature-title">Speech-Language Pathologist</div>
  </div>
`;

// User confirmation email - Spanish version
var contactUserEs = (name) => `
  <style>
    .greeting {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: #1e3040;
      margin-bottom: 16px;
    }

    .message-body {
      font-size: 15px;
      line-height: 1.75;
      color: #3a5568;
      margin-bottom: 24px;
    }

    .highlight-box {
      background: linear-gradient(145deg, #ffffff, #f0faf7);
      border-left: 4px solid #2a8f6f;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin: 24px 0;
    }

    .highlight-box p {
      font-size: 14px;
      color: #2a6655;
      line-height: 1.6;
    }

    .signature {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e2ecee;
    }

    .signature-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 600;
      color: #1e3040;
    }

    .signature-title {
      font-size: 13px;
      color: #6b8a96;
      margin-top: 2px;
    }
  </style>

  <p class="greeting">Hola, ${name} 👋</p>

  <p class="message-body">
    ¡Gracias por comunicarte! He recibido tu mensaje y me pondré en contacto contigo a la brevedad posible.
  </p>

  <div class="highlight-box">
    <p>
      Generalmente respondo dentro de <strong>1 a 2 días hábiles</strong>. Si tu consulta es urgente,
      no dudes en contactarme directamente a través del sitio web.
    </p>
  </div>

  <p class="message-body">
    Agradezco que te hayas tomado el tiempo de escribirme y espero poder hablar contigo pronto.
  </p>

  <div class="signature">
    <div class="signature-name">Careli Martínez Aquino, CCC-SLP</div>
    <div class="signature-title">Patóloga del Habla</div>
  </div>
`;

// Explicit global registry shared across hook files.
var __pbRoot = (typeof globalThis !== "undefined") ? globalThis : this;
if (!__pbRoot.__speechHubTemplates) {
  __pbRoot.__speechHubTemplates = {};
}
__pbRoot.__speechHubTemplates.emailLayout = emailLayout;
__pbRoot.__speechHubTemplates.contactAdmin = contactAdmin;
__pbRoot.__speechHubTemplates.contactUserEn = contactUserEn;
__pbRoot.__speechHubTemplates.contactUserEs = contactUserEs;
