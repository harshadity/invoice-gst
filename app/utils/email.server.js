import nodemailer from "nodemailer";

/**
 * Create reusable transporter
 * (Use Gmail / SMTP / SendGrid later)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email with PDF attachment
 */
export async function sendEmailWithAttachment({
  to,
  subject,
  message,
  pdf,
  filename,
}) {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  await transporter.sendMail({
    from: `"Invoice App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
    attachments: [
      {
        filename,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
