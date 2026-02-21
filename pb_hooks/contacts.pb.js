// contacts.pb.js
// Endpoint: POST /api/contact

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    data = $apis.requestInfo(c).data || {};
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
