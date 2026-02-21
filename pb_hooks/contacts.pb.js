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
      throw new Error(
        "Resend API error " + response.statusCode + ": " + String(response.raw || "")
      );
    }
  };

  try {
    if (
      typeof emailLayout !== "function" ||
      typeof contactAdmin !== "function" ||
      typeof contactUserEs !== "function" ||
      typeof contactUserEn !== "function"
    ) {
      throw new Error("Email templates are not loaded (emailLayout/contactAdmin/contactUserEs/contactUserEn).");
    }

    var adminHtml = emailLayout(contactAdmin(name, email, phone || "", message), "es");
    var adminText =
      "Nombre: " + name + "\n" +
      "Correo: " + email + "\n" +
      "Telefono: " + phoneText + "\n" +
      "Mensaje: " + message;

    sendWithResendApi({
      from: from,
      to: [adminEmail],
      subject: "Nuevo mensaje de " + name,
      html: adminHtml,
      text: adminText,
      reply_to: email,
    });

    var userSubject = lang === "es" ? "Recibimos tu mensaje" : "We received your message";
    var userContent = lang === "es" ? contactUserEs(name) : contactUserEn(name);
    var userHtml = emailLayout(userContent, lang);
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
