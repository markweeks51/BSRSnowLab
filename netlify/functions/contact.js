const MIN_FILL_TIME_MS = 3000;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function verifyTurnstile(token, secret, event) {
  const body = new URLSearchParams({ secret, response: token });
  const ip = event.headers["x-nf-client-connection-ip"];
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verify error:", err);
    return false;
  }
}

exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse form data
    const params = new URLSearchParams(event.body);
    const name       = params.get("full-name") || "";
    const email      = params.get("email") || "";
    const phone      = params.get("phone") || "Not provided";
    const service    = params.get("service") || "";
    const message    = params.get("message") || "";
    const honeypot   = params.get("company") || "";
    const loadedAt   = Number(params.get("form-loaded-at"));

    // Bot detection: honeypot filled in, or form submitted implausibly fast.
    // Redirect as if successful so bots don't learn they were caught.
    const submittedTooFast = !loadedAt || (Date.now() - loadedAt) < MIN_FILL_TIME_MS;
    if (honeypot.trim() !== "" || submittedTooFast) {
      return {
        statusCode: 302,
        headers: { Location: "/success.html" },
        body: "",
      };
    }

    // Cloudflare Turnstile: the widget adds a one-time token to the form;
    // verify it server-side before sending anything.
    const turnstileToken = params.get("cf-turnstile-response") || "";
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY is not set");
      return { statusCode: 500, body: "Server misconfigured" };
    }
    const verified = turnstileToken && (await verifyTurnstile(turnstileToken, secret, event));
    if (!verified) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: "<p>Verification failed. Please go back, wait for the check to complete, and try again.</p>",
      };
    }

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BSR Snow Lab <onboarding@resend.dev>",
        to: ["bsrsnowlab@gmail.com"],
        reply_to: email,
        subject: `New Enquiry — ${service}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A1628;color:#F0F4F8;padding:2rem;border-radius:8px;">
            <h2 style="color:#0EA5E9;margin-top:0;">New Enquiry from BSR Snow Lab Website</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#94A3B8;width:140px;">Name</td><td style="padding:8px 0;color:#F0F4F8;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Email</td><td style="padding:8px 0;color:#F0F4F8;"><a href="mailto:${escapeHtml(email)}" style="color:#0EA5E9;">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Phone</td><td style="padding:8px 0;color:#F0F4F8;">${escapeHtml(phone)}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Service</td><td style="padding:8px 0;color:#F0F4F8;">${escapeHtml(service)}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;vertical-align:top;">Message</td><td style="padding:8px 0;color:#F0F4F8;">${escapeHtml(message)}</td></tr>
            </table>
            <hr style="border-color:#1E3A5F;margin:1.5rem 0;" />
            <p style="color:#94A3B8;font-size:0.85rem;margin:0;">Sent from the contact form at bsrsnowlab.com</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to send email" }),
      };
    }

    // Redirect to success page
    return {
      statusCode: 302,
      headers: { Location: "/success.html" },
      body: "",
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
