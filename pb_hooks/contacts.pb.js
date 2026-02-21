// contacts.pb.js
// Endpoint: POST /api/speech-hub/contact

routerAdd("POST", "/api/speech-hub/contact", (c) => {
  var info = {};
  var data = {};
  var query = {};

  try {
    info = $apis.requestInfo(c);
    data = info && info.data ? info.data : {};
    query = info && info.query ? info.query : {};
  } catch (err) {
    data = {};
    query = {};
  }

  var pickValue = function(obj, key) {
    if (!obj || typeof obj !== "object") {
      return "";
    }

    var value = obj[key];
    if (Array.isArray(value)) {
      value = value.length ? value[0] : "";
    }
    if (value === null || typeof value === "undefined") {
      return "";
    }

    return String(value).trim();
  };

  var name = pickValue(data, "name") || pickValue(query, "name");
  var email = pickValue(data, "email") || pickValue(query, "email");
  var phone = pickValue(data, "phone") || pickValue(query, "phone");
  var message = pickValue(data, "message") || pickValue(query, "message");
  var langRaw = (pickValue(data, "lang") || pickValue(query, "lang")).toLowerCase();
  var lang = langRaw === "es" ? "es" : "en";

  if (!name || !email || !message) {
    return c.json(400, { message: "name, email and message are required" });
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json(400, { message: "Invalid email address" });
  }

  var settings = $app.settings();
  var meta = settings && settings.meta ? settings.meta : {};
  var senderAddress = $os.getenv("MAIL_FROM") || meta.senderAddress || "";
  var senderName = $os.getenv("MAIL_FROM_NAME") || meta.senderName || "";
  var adminEmail = $os.getenv("MAIL_ADMIN") || "";
  var resendApiKey = $os.getenv("RESEND_API_KEY") || "";

  if (!senderAddress || !adminEmail || !resendApiKey) {
    return c.json(500, {
      message: "Missing MAIL_FROM/MAIL_ADMIN/RESEND_API_KEY configuration",
    });
  }

  var from = senderName ? (senderName + " <" + senderAddress + ">") : senderAddress;
  var phoneText = phone ? phone : "N/A";

  var sendWithResendApi = function(payload) {
    var response = $http.send({
      url: "https://api.resend.com/emails",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + resendApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(
        "Resend API error " + response.statusCode + ": " + String(response.raw || "")
      );
    }
  };

  try {
    sendWithResendApi({
      from: from,
      to: [adminEmail],
      subject: "Nuevo mensaje de " + name,
      html:
        "<p><strong>Nombre:</strong> " + name + "</p>" +
        "<p><strong>Correo:</strong> " + email + "</p>" +
        "<p><strong>Telefono:</strong> " + phoneText + "</p>" +
        "<p><strong>Mensaje:</strong><br/>" + message + "</p>",
      text:
        "Nombre: " + name + "\n" +
        "Correo: " + email + "\n" +
        "Telefono: " + phoneText + "\n" +
        "Mensaje: " + message,
      reply_to: email,
    });

    var userSubject = lang === "es" ? "Recibimos tu mensaje" : "We received your message";
    var userHtml = lang === "es"
      ? "<p>Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto.</p>"
      : "<p>Thanks for reaching out. We received your message and will reply soon.</p>";
    var userText = lang === "es"
      ? "Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto."
      : "Thanks for reaching out. We received your message and will reply soon.";

    sendWithResendApi({
      from: from,
      to: [email],
      subject: userSubject,
      html: userHtml,
      text: userText,
    });

    return c.json(200, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err);
    return c.json(500, { message: "Failed to send message. Please try again." });
  }
});
