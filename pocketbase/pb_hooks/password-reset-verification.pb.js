/// <reference path="../pb_data/types.d.ts" />
 
// Handle password reset email via Resend API.
//
// The Resend API key is NOT stored in this file. It is read from the
// RESEND_API_KEY environment variable (set it in Railway > your PocketBase
// service > Variables). The previous version had the key hardcoded here, which
// put it in git history — that key must be revoked in Resend.
onRecordRequestPasswordResetRequest((e) => {
  const email = e.record.get("email");
  const token = e.record.get("passwordResetToken");
  const resetUrl = `https://casaceo.com/password-confirm?token=${token}`;
 
  const resendKey = $os.getenv("RESEND_API_KEY");
  if (!resendKey) {
    // Fail loudly in the logs, but never block the password-reset request itself.
    console.error("RESEND_API_KEY is not set — password reset email NOT sent to: " + email);
    e.next();
    return;
  }
 
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
    console.log("Password reset email sent to: " + email);
  } catch (err) {
    console.error("Failed to send reset email: " + err);
  }
 
  e.next();
}, "users");
