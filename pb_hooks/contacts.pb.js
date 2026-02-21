// contacts.pb.js
// Endpoint: POST /api/speech-hub/contact

var CONTACTS_HOOK_VERSION = "2026-02-21-debug-1";
console.log("[hooks] contacts.pb.js loaded:", CONTACTS_HOOK_VERSION);
var API_PREFIX = "/api/speech-hub";

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Sentinel route to verify that custom JS hooks are really loaded.
routerAdd("GET", API_PREFIX + "/_debug/hooks", (c) => {
  return c.json(200, {
    ok: true,
    hook: "contacts.pb.js",
    version: CONTACTS_HOOK_VERSION,
  });
});

// Handle CORS preflight
routerAdd("OPTIONS", API_PREFIX + "/contact", (c) => {
  for (var key in CORS_HEADERS) {
    c.response().header().set(key, CORS_HEADERS[key]);
  }
  return c.string(204, "");
});

routerAdd("POST", API_PREFIX + "/contact", (c) => {
  for (var key in CORS_HEADERS) {
    c.response().header().set(key, CORS_HEADERS[key]);
  }

  let data = {};
  try {
    c.bindBody(data);
  } catch (err) {
    console.error("Invalid contact request payload:", err);
    return c.json(400, {
      message: "Invalid request body. Send valid JSON with Content-Type: application/json.",
    });
  }

  if (typeof data !== "object" || Array.isArray(data)) {
    return c.json(400, {
      message: "Invalid request body. Expected a JSON object.",
    });
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const phone = typeof data.phone === "string" ? data.phone.trim() : null;
  const message = String(data.message || "").trim();
  const lang = data.lang === "es" ? "es" : "en";

  // Validate required fields
  if (!name || !email || !message) {
    return c.json(400, { message: "name, email and message are required" });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json(400, { message: "Invalid email address" });
  }

  try {
    sendContactEmails(
      name,
      email,
      phone,
      message,
      lang
    );

    return c.json(200, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err);
    return c.json(500, { message: "Failed to send message. Please try again." });
  }
});

// Minimal smoke test to isolate mail delivery from request body parsing.
routerAdd("GET", API_PREFIX + "/contact-smoke", (c) => {
  for (var key in CORS_HEADERS) {
    c.response().header().set(key, CORS_HEADERS[key]);
  }

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
