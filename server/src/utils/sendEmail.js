import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing");
  }

  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2" },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

const parseFrom = (fromValue) => {
  if (!fromValue) {
    return { name: "ParkPing", email: process.env.SMTP_USER || "" };
  }

  const match = fromValue.match(/^(.*)<([^>]+)>$/);
  if (!match) {
    return { name: "ParkPing", email: fromValue.trim() };
  }

  return {
    name: match[1].trim().replace(/^"|"$/g, "") || "ParkPing",
    email: match[2].trim()
  };
};

const sendWithBrevoApi = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing");
  }

  const fromValue = process.env.SMTP_FROM || process.env.SMTP_USER;
  const sender = parseFrom(fromValue);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API failed: ${response.status} ${errorText}`);
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    if (!process.env.BREVO_API_KEY) {
      throw error;
    }

    // Fallback to Brevo HTTP API when SMTP is blocked/timeouts on Render.
    await sendWithBrevoApi({ to, subject, text, html });
  }
};
