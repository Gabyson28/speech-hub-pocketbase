// custom-email.pb.js
// Endpoint: POST /api/send-custom-email
// Requires an authenticated user to avoid creating an open email relay.

const CUSTOM_EMAIL_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

routerAdd("OPTIONS", "/api/send-custom-email", (c) => {
  for (var key in CUSTOM_EMAIL_CORS_HEADERS) {
    c.response().header().set(key, CUSTOM_EMAIL_CORS_HEADERS[key]);
  }
  return c.string(204, "");
});

routerAdd("POST", "/api/send-custom-email", (c) => {
  for (var key in CUSTOM_EMAIL_CORS_HEADERS) {
    c.response().header().set(key, CUSTOM_EMAIL_CORS_HEADERS[key]);
  }

  const info = $apis.requestInfo(c);
  if (!info.auth) {
    return c.json(401, { message: "Authentication required" });
  }

  const data = info.data || {};
  const email = String(data.email || "").trim();
  const subject = String(data.subject || "").trim();
  const html = String(data.html || "").trim();
  const text = typeof data.text === "string" ? data.text : "";
  const replyTo = typeof data.replyTo === "string" ? data.replyTo.trim() : "";

  if (!email || !subject || !html) {
    return c.json(400, { message: "email, subject and html are required" });
  }

  if (!isValidEmail(email)) {
    return c.json(400, { message: "Invalid recipient email address" });
  }

  if (replyTo && !isValidEmail(replyTo)) {
    return c.json(400, { message: "Invalid replyTo email address" });
  }

  try {
    sendCustomEmail(email, subject, html, text || null, replyTo || null);
    return c.json(200, { message: "Email sent successfully" });
  } catch (err) {
    console.error("Custom email error:", err);
    return c.json(500, { message: "Failed to send email" });
  }
});
