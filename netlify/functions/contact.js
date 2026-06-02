exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse form data
    const params = new URLSearchParams(event.body);
    const name    = params.get("full-name") || "";
    const email   = params.get("email") || "";
    const phone   = params.get("phone") || "Not provided";
    const service = params.get("service") || "";
    const message = params.get("message") || "";

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
              <tr><td style="padding:8px 0;color:#94A3B8;width:140px;">Name</td><td style="padding:8px 0;color:#F0F4F8;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Email</td><td style="padding:8px 0;color:#F0F4F8;"><a href="mailto:${email}" style="color:#0EA5E9;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Phone</td><td style="padding:8px 0;color:#F0F4F8;">${phone}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Service</td><td style="padding:8px 0;color:#F0F4F8;">${service}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;vertical-align:top;">Message</td><td style="padding:8px 0;color:#F0F4F8;">${message}</td></tr>
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
