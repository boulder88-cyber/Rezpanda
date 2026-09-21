/// <reference path="../pb_data/types.d.ts" />
 
// Handle password reset email via Resend API.
//
// The Resend API key is NOT stored in this file. It is read from the
// RESEND_API_KEY environment variable (Railway > PocketBase service > Variables).
//
// Note: $http.send does NOT throw when the server answers with an error status
// (401, 403, 422...). It just returns the response. So we check res.statusCode
// ourselves and log what Resend said — otherwise a rejected email looks "sent".
onRecordRequestPasswordResetRequest((e) => {
  const email = e.record.get("email");
  const token = e.record.get("passwordResetToken");
  const resetUrl = `https://casaceo.com/password-confirm?token=${token}`;
 
  // Trim whitespace/newlines and stray quotes that sometimes ride along when a
  // key is pasted into an environment-variable box.
  const resendKey = ($os.getenv("RESEND_API_KEY") || "")
    .trim()
    .replace(/^["']+|["']+$/g, "");
 
  if (!resendKey) {
    // Fail loudly in the logs, but never block the password-reset request itself.
    console.error("RESEND_API_KEY is not set — password reset email NOT sent to: " + email);
    e.next();
    return;
  }
 
  // Length only (never the key itself) — helps spot a truncated or padded value.
  console.log("Password reset: RESEND_API_KEY present, length=" + resendKey.length);
 
  try {
    const res = $http.send({
      url: "https://api.resend.com/emails",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + resendKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "CasaCEO <noreply@casaceo.com>",
        to: [email],
        subject: "Reset your CasaCEO password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1e3a5f;">Reset Your Password</h2>
            <p style="color: #555;">Hi there! We received a request to reset your CasaCEO password.</p>
            <a href="${resetUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #999; font-size: 13px;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
              <p style="color: #999; font-size: 13px;">Or copy this link: ${resetUrl}</p>
          </div>
        `
      })
    });
 
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log("Password reset email accepted by Resend for: " + email + " (status " + res.statusCode + ")");
    } else {
      console.error("Resend REJECTED the reset email for " + email +
        " — status " + res.statusCode + " — body: " + res.raw);
    }
  } catch (err) {
    console.error("Failed to send reset email: " + err);
  }
 
  e.next();
}, "users");
 
