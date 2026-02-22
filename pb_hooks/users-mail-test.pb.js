// users-mail-test.pb.js
// Sends a custom email after a new user record is created.

onRecordCreateRequest((e) => {
  e.next();

  try {
    const recipient =
      typeof e.record.email === "function"
        ? e.record.email()
        : String(e.record.get("email") || "");

    if (!recipient) {
      console.log("[users-mail-test] skipped: new user has no email");
      return;
    }

    const message = new MailerMessage({
      from: {
        address: e.app.settings().meta.senderAddress,
        name: e.app.settings().meta.senderName,
      },
      to: [{ address: recipient }],
      subject: "Prueba de correo (PocketBase)",
      html:
        "<p>Este correo confirma que <strong>newMailClient()</strong> funciona desde onRecordCreateRequest.</p>",
      text: "Prueba de correo desde PocketBase.",
    });

    e.app.newMailClient().send(message);
    console.log("[users-mail-test] custom email sent to:", recipient);
  } catch (err) {
    console.error("[users-mail-test] send error:", err);
  }
}, "users");
