// Admin notification email - when someone submits the contact form
const contactAdmin = (name, email, phone, message) => `
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

  <p class="section-title">Nuevo mensaje de contacto</p>

  <div class="label">Nombre</div>
  <div class="value">${name}</div>

  <div class="label">Correo</div>
  <div class="value"><a href="mailto:${email}" style="color:#2a8f6f;text-decoration:none;">${email}</a></div>

  ${phone ? `
  <div class="label">Teléfono</div>
  <div class="value"><a href="tel:${phone}" style="color:#2a8f6f;text-decoration:none;">${phone}</a></div>
  ` : ''}

  <hr class="divider" />

  <div class="label">Mensaje</div>
  <div class="message-value">${message}</div>
`;

module.exports = { contactAdmin };
