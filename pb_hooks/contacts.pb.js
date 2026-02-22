// contacts.pb.js
// Endpoint: POST /api/speech-hub/contact

routerAdd("POST", "/api/speech-hub/contact", (c) => {
  var data = {};
  var query = {};
  var form = {};
  var req = null;

  // 1) Try native body binding (JSON)
  try {
    c.bindBody(data);
  } catch (_) {}

  // 2) Fallback to requestInfo data/query
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    try {
      var info = $apis.requestInfo(c);
      data = info && info.data ? info.data : {};
      query = info && info.query ? info.query : {};
    } catch (_) {
      data = {};
      query = {};
    }
  }

  // 3) Fallback to form/query helpers
  try {
    req = typeof c.request === "function" ? c.request() : c.request;
  } catch (_) {}

  if (req) {
    try { req.parseForm(); } catch (_) {}
  }

  try { form.name = c.formValue("name"); } catch (_) {}
  try { form.email = c.formValue("email"); } catch (_) {}
  try { form.phone = c.formValue("phone"); } catch (_) {}
  try { form.message = c.formValue("message"); } catch (_) {}
  try { form.lang = c.formValue("lang"); } catch (_) {}

  // parseForm() fallback for x-www-form-urlencoded
  var readVal = function(values, key) {
    if (!values) return "";
    try {
      if (typeof values.get === "function") {
        var got = values.get(key);
        return got === null || typeof got === "undefined" ? "" : String(got);
      }
    } catch (_) {}
    try {
      var raw = values[key];
      if (Array.isArray(raw)) return raw.length ? String(raw[0]) : "";
      if (raw === null || typeof raw === "undefined") return "";
      return String(raw);
    } catch (_) {}
    return "";
  };

  if (!form.name) form.name = readVal(req && req.form, "name") || readVal(req && req.postForm, "name");
  if (!form.email) form.email = readVal(req && req.form, "email") || readVal(req && req.postForm, "email");
  if (!form.phone) form.phone = readVal(req && req.form, "phone") || readVal(req && req.postForm, "phone");
  if (!form.message) form.message = readVal(req && req.form, "message") || readVal(req && req.postForm, "message");
  if (!form.lang) form.lang = readVal(req && req.form, "lang") || readVal(req && req.postForm, "lang");

  try { query.name = query.name || c.queryParam("name"); } catch (_) {}
  try { query.email = query.email || c.queryParam("email"); } catch (_) {}
  try { query.phone = query.phone || c.queryParam("phone"); } catch (_) {}
  try { query.message = query.message || c.queryParam("message"); } catch (_) {}
  try { query.lang = query.lang || c.queryParam("lang"); } catch (_) {}

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

  var name = pickValue(data, "name") || pickValue(form, "name") || pickValue(query, "name");
  var email = pickValue(data, "email") || pickValue(form, "email") || pickValue(query, "email");
  var phone = pickValue(data, "phone") || pickValue(form, "phone") || pickValue(query, "phone");
  var message = pickValue(data, "message") || pickValue(form, "message") || pickValue(query, "message");
  var langRaw = (pickValue(data, "lang") || pickValue(form, "lang") || pickValue(query, "lang")).toLowerCase();
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
      var details = "";
      try {
        if (response.json) {
          details = JSON.stringify(response.json);
        } else if (response.raw) {
          details = String(response.raw);
        } else if (response.body) {
          details = String(response.body);
        }
      } catch (_) {}
      throw new Error(
        "Resend API error " + response.statusCode + (details ? ": " + details : "")
      );
    }
  };

  try {
    // Use global template functions when available; otherwise use local styled fallbacks.
    var layoutFn = typeof emailLayout === "function"
      ? emailLayout
      : function(content, lang) {
          var title = lang === "es" ? "Patologa del Habla" : "Speech-Language Pathologist";
          var footerNote = lang === "es"
            ? "Este correo fue enviado automaticamente. Por favor no respondas directamente a este mensaje."
            : "This email was sent automatically. Please do not reply directly to this message.";
          var websiteUrl = "https://carelimartinezphl.com";
          return (
            "<!DOCTYPE html><html><head><meta charset=\"UTF-8\" />" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>" +
            "<style>" +
            "body{margin:0;background:#eef4f5;font-family:Arial,sans-serif;color:#1e3040;padding:16px;}" +
            ".wrapper{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(30,60,80,0.12);}" +
            ".header{background:linear-gradient(135deg,#2a8f6f 0%,#2e9e82 50%,#2b9bb5 100%);padding:28px 24px;text-align:center;color:#ffffff;}" +
            ".header-name{font-size:22px;font-weight:700;line-height:1.2;}" +
            ".header-title{font-size:12px;opacity:0.9;letter-spacing:0.4px;margin-top:6px;text-transform:uppercase;}" +
            ".content{padding:28px 24px 20px;}" +
            ".footer{background:#f0f6f7;border-top:1px solid #d8e8ea;padding:16px 24px;text-align:center;color:#6b8a96;font-size:12px;line-height:1.6;}" +
            ".footer a{color:#2a8f6f;text-decoration:none;}" +
            ".footer-divider{width:40px;height:2px;background:linear-gradient(90deg,#2a8f6f,#2b9bb5);margin:8px auto;border-radius:2px;}" +
            "</style>" +
            "</head><body><div class=\"wrapper\"><div class=\"header\">" +
            "<div class=\"header-name\">Careli Martinez Aquino, CCC-SLP</div>" +
            "<div class=\"header-title\">" + title + "</div>" +
            "</div><div class=\"content\">" + content + "</div>" +
            "<div class=\"footer\"><div class=\"footer-divider\"></div>" +
            "<div><a href=\"" + websiteUrl + "\">carelimartinezphl.com</a></div>" +
            "<div>" + footerNote + "</div></div></div></body></html>"
          );
        };

    var adminTplFn = typeof contactAdmin === "function"
      ? contactAdmin
      : function(n, e, p, m) {
          return (
            "<h2 style=\"margin:0 0 18px;font-size:22px;\">Nuevo mensaje de contacto</h2>" +
            "<p style=\"margin:0 0 8px;\"><strong>Nombre:</strong> " + n + "</p>" +
            "<p style=\"margin:0 0 8px;\"><strong>Correo:</strong> " + e + "</p>" +
            "<p style=\"margin:0 0 14px;\"><strong>Telefono:</strong> " + (p || "N/A") + "</p>" +
            "<div style=\"background:#f0f6f7;border-radius:8px;padding:12px 14px;line-height:1.6;\">" +
            "<strong>Mensaje:</strong><br/>" + m +
            "</div>"
          );
        };

    var userEsTplFn = typeof contactUserEs === "function"
      ? contactUserEs
      : function(n) {
          return (
            "<p style=\"font-size:20px;font-weight:700;margin:0 0 14px;\">Hola, " + n + "</p>" +
            "<p style=\"margin:0 0 12px;line-height:1.7;\">Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto.</p>" +
            "<p style=\"margin:0;line-height:1.7;\">Generalmente respondemos dentro de 1 a 2 dias habiles.</p>"
          );
        };

    var userEnTplFn = typeof contactUserEn === "function"
      ? contactUserEn
      : function(n) {
          return (
            "<p style=\"font-size:20px;font-weight:700;margin:0 0 14px;\">Hello, " + n + "</p>" +
            "<p style=\"margin:0 0 12px;line-height:1.7;\">Thanks for reaching out. We received your message and will reply soon.</p>" +
            "<p style=\"margin:0;line-height:1.7;\">We usually respond within 1-2 business days.</p>"
          );
        };

    var adminHtml = layoutFn(adminTplFn(name, email, phone || "", message), "es");
    var adminText =
      "Nombre: " + name + "\n" +
      "Correo: " + email + "\n" +
      "Telefono: " + phoneText + "\n" +
      "Mensaje: " + message;

    // Admin notification is the critical send.
    sendWithResendApi({
      from: from,
      to: [adminEmail],
      subject: "Nuevo mensaje de " + name,
      html: adminHtml,
      text: adminText,
      reply_to: email,
    });

    var userSubject = lang === "es" ? "Recibimos tu mensaje" : "We received your message";
    var userContent = lang === "es" ? userEsTplFn(name) : userEnTplFn(name);
    var userHtml = layoutFn(userContent, lang);
    var userText = lang === "es"
      ? "Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto."
      : "Thanks for reaching out. We received your message and will reply soon.";

    var userSendWarning = "";
    try {
      sendWithResendApi({
        from: from,
        to: [email],
        subject: userSubject,
        html: userHtml,
        text: userText,
      });
    } catch (userErr) {
      userSendWarning = String(userErr);
      console.error("User confirmation email error:", userErr);
    }

    if (userSendWarning) {
      return c.json(200, {
        message: "Message sent successfully",
        warning: "User confirmation email failed",
        error: userSendWarning,
      });
    }

    return c.json(200, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err);
    return c.json(500, {
      message: "Failed to send message. Please try again.",
      error: String(err),
    });
  }
});
