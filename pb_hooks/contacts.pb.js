// contacts.pb.js
// Endpoint: POST /api/speech-hub/contact

var CONTACTS_HOOK_VERSION = "2026-02-21-debug-1";
console.log("[hooks] contacts.pb.js loaded:", CONTACTS_HOOK_VERSION);
var API_PREFIX = "/api/speech-hub";

// Sentinel route to verify that custom JS hooks are really loaded.
routerAdd("GET", API_PREFIX + "/_debug/hooks", (c) => {
  return c.json(200, {
    ok: true,
    hook: "contacts.pb.js",
    version: CONTACTS_HOOK_VERSION,
  });
});

// Generic SMTP test endpoint (no payload parsing).
routerAdd("POST", API_PREFIX + "/contact-generic", (c) => {
  try {
    var settings = $app.settings();
    var meta = settings && settings.meta ? settings.meta : {};
    var senderAddress = $os.getenv("MAIL_FROM") || meta.senderAddress || "";
    var senderName = $os.getenv("MAIL_FROM_NAME") || meta.senderName || "";
    var adminEmail = $os.getenv("MAIL_ADMIN") || "";

    if (!senderAddress) {
      return c.json(500, { message: "Missing sender email (MAIL_FROM or mail settings senderAddress)." });
    }
    if (!adminEmail) {
      return c.json(500, { message: "Missing MAIL_ADMIN environment variable." });
    }

    var from = { address: senderAddress };
    if (senderName) {
      from.name = senderName;
    }

    var now = new Date().toISOString();
    var msg = new MailerMessage({
      from: from,
      to: [{ address: adminEmail }],
      subject: "[Contact Test] Generic endpoint",
      html: "<p>Generic contact test sent at " + now + "</p>",
      text: "Generic contact test sent at " + now,
    });

    $app.newMailClient().send(msg);
    return c.json(200, {
      message: "Generic test email sent successfully.",
      to: adminEmail,
      at: now,
    });
  } catch (err) {
    console.error("Generic contact test error:", err);
    return c.json(500, {
      message: "Generic test email failed.",
      error: String(err),
    });
  }
});

routerAdd("POST", API_PREFIX + "/contact", (c) => {
  let data = {};
  let query = {};
  let headers = {};
  let parseError = null;
  try {
    const info = $apis.requestInfo(c);
    data = (info && info.data) ? info.data : {};
    query = (info && info.query) ? info.query : {};
    headers = (info && info.headers) ? info.headers : {};
  } catch (err) {
    parseError = err;
    data = {};
    query = {};
    headers = {};
  }

  // Fallbacks for form-data/x-www-form-urlencoded/query params (eg. Postman tests)
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
    const fallback = {};
    try { fallback.name = c.formValue("name"); } catch (_) {}
    try { fallback.email = c.formValue("email"); } catch (_) {}
    try { fallback.phone = c.formValue("phone"); } catch (_) {}
    try { fallback.message = c.formValue("message"); } catch (_) {}
    try { fallback.lang = c.formValue("lang"); } catch (_) {}

    try { fallback.name = fallback.name || c.queryParam("name"); } catch (_) {}
    try { fallback.email = fallback.email || c.queryParam("email"); } catch (_) {}
    try { fallback.phone = fallback.phone || c.queryParam("phone"); } catch (_) {}
    try { fallback.message = fallback.message || c.queryParam("message"); } catch (_) {}
    try { fallback.lang = fallback.lang || c.queryParam("lang"); } catch (_) {}

    data = fallback;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    console.error("Invalid contact request payload:", parseError);
    return c.json(400, {
      message: "Invalid request body. Send JSON or form-data with name, email, message.",
      error: parseError ? String(parseError) : "unknown",
    });
  }

  const pick = (obj, key) => {
    if (!obj || typeof obj !== "object") {
      return "";
    }

    let val = obj[key];
    if (Array.isArray(val)) {
      val = val.length ? val[0] : "";
    }
    if (val === null || typeof val === "undefined") {
      return "";
    }

    return String(val).trim();
  };

  const name = pick(data, "name") || pick(query, "name");
  const email = pick(data, "email") || pick(query, "email");
  const phoneRaw = pick(data, "phone") || pick(query, "phone");
  const phone = phoneRaw || null;
  const message = pick(data, "message") || pick(query, "message");
  const langRaw = (pick(data, "lang") || pick(query, "lang")).toLowerCase();
  const lang = langRaw === "es" ? "es" : "en";

  // Validate required fields
  if (!name || !email || !message) {
    return c.json(400, {
      message: "name, email and message are required",
      debug: {
        receivedData: data,
        receivedQuery: query,
        contentType:
          pick(headers, "content-type") ||
          pick(headers, "Content-Type") ||
          "",
      },
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json(400, { message: "Invalid email address" });
  }

  try {
    if (typeof sendContactEmails === "function") {
      sendContactEmails(
        name,
        email,
        phone,
        message,
        lang
      );
    } else {
      // Fallback when PocketBase runtime isolates handlers from custom globals.
      const settings = $app.settings();
      const meta = settings && settings.meta ? settings.meta : {};
      const senderAddress = $os.getenv("MAIL_FROM") || meta.senderAddress || "";
      const senderName = $os.getenv("MAIL_FROM_NAME") || meta.senderName || "";
      const adminEmail = $os.getenv("MAIL_ADMIN") || "";

      if (!senderAddress || !adminEmail) {
        throw new Error("Missing MAIL_FROM/senderAddress or MAIL_ADMIN configuration.");
      }

      const from = { address: senderAddress };
      if (senderName) {
        from.name = senderName;
      }

      const adminMsg = new MailerMessage({
        from: from,
        to: [{ address: adminEmail }],
        subject: "Nuevo mensaje de " + name,
        html:
          "<p><strong>Nombre:</strong> " + name + "</p>" +
          "<p><strong>Correo:</strong> " + email + "</p>" +
          "<p><strong>Telefono:</strong> " + (phone || "N/A") + "</p>" +
          "<p><strong>Mensaje:</strong><br/>" + message + "</p>",
        text:
          "Nombre: " + name + "\n" +
          "Correo: " + email + "\n" +
          "Telefono: " + (phone || "N/A") + "\n" +
          "Mensaje: " + message,
        replyTo: [{ address: email }],
      });

      $app.newMailClient().send(adminMsg);

      const userSubject = lang === "es" ? "Recibimos tu mensaje" : "We received your message";
      const userHtml = lang === "es"
        ? "<p>Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto.</p>"
        : "<p>Thanks for reaching out. We received your message and will reply soon.</p>";
      const userText = lang === "es"
        ? "Gracias por comunicarte. Recibimos tu mensaje y te responderemos pronto."
        : "Thanks for reaching out. We received your message and will reply soon.";

      const userMsg = new MailerMessage({
        from: from,
        to: [{ address: email }],
        subject: userSubject,
        html: userHtml,
        text: userText,
      });

      $app.newMailClient().send(userMsg);
    }

    return c.json(200, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err);
    return c.json(500, { message: "Failed to send message. Please try again." });
  }
});

// Minimal smoke test to isolate mail delivery from request body parsing.
routerAdd("GET", API_PREFIX + "/contact-smoke", (c) => {
  try {
    const adminEmail =
      $os.getenv("MAIL_ADMIN") ||
      (typeof config !== "undefined" && config ? config.adminEmail : "");
    if (!adminEmail) {
      return c.json(500, { message: "Missing MAIL_ADMIN environment variable." });
    }

    const settings = $app.settings();
    const meta = settings && settings.meta ? settings.meta : {};
    const senderAddress =
      $os.getenv("MAIL_FROM") ||
      (typeof config !== "undefined" && config ? config.fromEmail : "") ||
      meta.senderAddress;
    const senderName =
      $os.getenv("MAIL_FROM_NAME") ||
      (typeof config !== "undefined" && config ? config.fromName : "") ||
      meta.senderName ||
      "";

    if (!senderAddress) {
      return c.json(500, {
        message: "Missing sender email. Configure mail settings or MAIL_FROM.",
      });
    }

    const from = { address: senderAddress };
    if (senderName) {
      from.name = senderName;
    }

    const now = new Date().toISOString();
    const message = new MailerMessage({
      from: from,
      to: [{ address: adminEmail }],
      subject: "[PocketBase] Contact smoke test",
      html: "<p>Smoke test OK at " + now + "</p>",
      text: "Smoke test OK at " + now,
    });

    $app.newMailClient().send(message);
    return c.json(200, {
      message: "Smoke test email sent successfully.",
      to: adminEmail,
    });
  } catch (err) {
    console.error("Contact smoke test error:", err);
    return c.json(500, { message: "Smoke test email failed." });
  }
});
