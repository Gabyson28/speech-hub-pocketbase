// User confirmation email - English version
const contactUserEn = (name) => `
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

module.exports = { contactUserEn };
