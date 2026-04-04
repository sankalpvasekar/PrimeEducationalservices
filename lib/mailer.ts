import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-brevo.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string, name: string) {
  await transporter.sendMail({
    from: `"Prime Educational Services" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Your OTP for Password Reset',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FFFBF2; border-radius: 16px; border: 1px solid #C5A059;">
        <h2 style="color: #5D4037; font-size: 24px; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="color: #6B5344; margin-bottom: 24px;">Your One-Time Password (OTP) for Prime Educational Services is:</p>
        <div style="background: #5D4037; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px; border-radius: 12px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #6B5344; margin-top: 24px; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: 1px solid #C5A059; margin: 24px 0;" />
        <p style="color: #A1887F; font-size: 12px;">Prime Educational Services — Premium Study Material</p>
      </div>
    `,
  });
}
