import crypto from "node:crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return (
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  );
}

export async function createEmailVerification(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await db.emailVerificationToken.upsert({
    where: { userId: user.id },
    update: {
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    },
    create: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const verificationUrl = `${getAppUrl()}/verify-email?token=${rawToken}`;
  const recipientName = user.name?.trim() || user.email;
  const text = [
    `Hi ${recipientName},`,
    "",
    "Verify your email address to activate your Applin account:",
    verificationUrl,
    "",
    "This link expires in 24 hours.",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1c1917; line-height: 1.6;">
      <p>Hi ${recipientName},</p>
      <p>Verify your email address to activate your Applin account.</p>
      <p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;border-radius:999px;text-decoration:none;">
          Verify email
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;

  const delivery = await sendEmail({
    to: user.email,
    subject: "Verify your Applin email",
    text,
    html,
  });

  return {
    delivery: delivery.mode,
    verificationUrl,
  };
}

export async function resendEmailVerification(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || !user.password || user.emailVerifiedAt) {
    return { status: "noop" as const };
  }

  const result = await createEmailVerification(user);
  return {
    status: "sent" as const,
    delivery: result.delivery,
  };
}

export async function consumeEmailVerificationToken(token: string) {
  if (!token) {
    return { status: "missing" as const };
  }

  const tokenHash = hashToken(token);
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          emailVerifiedAt: true,
        },
      },
    },
  });

  if (!record) {
    return { status: "invalid" as const };
  }

  if (record.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { id: record.id } });
    return {
      status: "expired" as const,
      email: record.user.email,
    };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
    }),
    db.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);

  return {
    status: "verified" as const,
    email: record.user.email,
  };
}
