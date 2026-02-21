// contact.pb.js
// Endpoint: POST /api/contact

routerAdd("POST", "/api/contact", (c) => {
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