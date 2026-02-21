// contacts.pb.js
// Endpoint: POST /api/contact

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight
routerAdd("OPTIONS", "/api/contact", (c) => {
  for (var key in CORS_HEADERS) {
    c.response().header().set(key, CORS_HEADERS[key]);
  }
  return c.string(204, "");
});

routerAdd("POST", "/api/contact", (c) => {
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
routerAdd("GET", "/api/contact-smoke", (c) => {
  for (var key in CORS_HEADERS) {
    c.response().header().set(key, CORS_HEADERS[key]);
  }

  const adminEmail = config.adminEmail;
  if (!adminEmail) {
    return c.json(500, { message: "Missing MAIL_ADMIN environment variable." });
  }

  try {
    const settings = $app.settings();
    const meta = settings && settings.meta ? settings.meta : {};
    const senderAddress = config.fromEmail || meta.senderAddress;
    const senderName = config.fromName || meta.senderName || "";

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
      html: `<p>Smoke test OK at ${now}</p>`,
      text: `Smoke test OK at ${now}`,
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
