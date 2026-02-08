import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";


const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL;
const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : APP_URL
  ? [APP_URL]
  : [];

if (!SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP_USER or SMTP_PASS is not set. Verification emails will fail to send.');
}

if (!APP_URL && TRUSTED_ORIGINS.length === 0) {
    console.warn('APP_URL and TRUSTED_ORIGINS are not set. Constructed verification links and trusted origins may be invalid.');
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: TRUSTED_ORIGINS,

    user: {
        additionalFields: {
            role: {
                type: "string",
                label: "Role",
                required: true,
                options: [
                    { value: "CUSTOMER", label: "Customer" },
                    { value: "PROVIDER", label: "Provider" }
                ],
                defaultValue: "CUSTOMER"
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            if (!user?.email) {
                console.warn('No recipient email available for verification email.');
                return;
            }

            if (!url && !APP_URL) {
                console.error('No verification URL available (url param and APP_URL missing). Skipping email to', user.email);
                return;
            }

            const verificationUrl = url ?? `${APP_URL}/verify-email?token=${token}`;

            try {
                const info = await transporter.sendMail({
                    from: `"SnackSnap" <${SMTP_USER ?? 'no-reply@snacksnap.local'}>`,
                    to: user.email,
                    subject: "Verify your email address",
                    html: `<!doctype html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verify your email</title>
    <style>
        body { font-family: Arial, sans-serif; background-color:#f6f9fc; color:#333; margin:0; padding:0; }
        .container { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
        .btn { display:inline-block; padding:12px 20px; color:#fff; background:#0070f3; border-radius:6px; text-decoration:none; }
        .footer { font-size:12px; color:#666; margin-top:20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Confirm your email address</h2>
        <p>Hello ${user.email},</p>
        <p>Thanks for signing up for SnackSnap. Please confirm your email address by clicking the button below:</p>
        <p style="text-align:center; margin:28px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                    <td align="center">
                        <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer"
                           style="background:#1a73e8; color:#ffffff; padding:14px 28px; border-radius:8px; display:inline-block; text-decoration:none; font-weight:600; font-size:16px; line-height:1; box-shadow:0 6px 18px rgba(26,115,232,0.25);">
                           Verify Email
                        </a>
                    </td>
                </tr>
            </table>
        </p>
        <p style="word-break:break-all;">If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="font-size:13px; color:#0066cc; word-break:break-all;"><a href="${verificationUrl}" style="color:#0066cc; text-decoration:underline;">${verificationUrl}</a></p>
        <p class="footer">If you didn't request this, you can safely ignore this email.</p>
    </div>
</body>
</html>`,
                });

                console.log("Verification email sent to", user.email, "messageId:", info.messageId);
            } catch (error) {
                console.error(`Failed to send verification email to ${user.email}:`, error);
            }
        },
    },
});
