import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email, name, resetUrl) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:#ff6b35;padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Reset Your Password</h1>
                      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">We received a request to reset your password</p>
                    </td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                        Someone requested a password reset for your account. Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
                      </p>

                      <!-- BUTTON -->
                      <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                        <tr>
                          <td style="background:#ff6b35;border-radius:8px;">
                            <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Or copy and paste this link in your browser:</p>
                      <p style="margin:0 0 32px;font-size:13px;color:#ff6b35;word-break:break-all;">${resetUrl}</p>

                      <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;">

                      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                        If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">This email was sent automatically. Please do not reply.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}