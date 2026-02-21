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

  const data = $apis.requestInfo(c).data;

  // Validate required fields
  if (!data.name || !data.email || !data.message) {
    return c.json(400, { message: "name, email and message are required" });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return c.json(400, { message: "Invalid email address" });
  }

  const lang = data.lang === "es" ? "es" : "en";

  try {
    sendContactEmails(
      data.name,
      data.email,
      data.phone || null,
      data.message,
      lang
    );

    return c.json(200, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err);
    return c.json(500, { message: "Failed to send message. Please try again." });
  }
});
