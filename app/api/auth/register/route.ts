import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createEmailVerification } from "@/lib/email-verification";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const name = result.data.name?.trim() || null;
    const email = result.data.email.trim().toLowerCase();
    const password = result.data.password;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.emailVerifiedAt
            ? "User with this email already exists"
            : "User with this email already exists but is not yet verified. Use the resend link option from sign in.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const verification = await createEmailVerification(user);

    return NextResponse.json(
      {
        data: user,
        message:
          verification.delivery === "smtp"
            ? "Account created. Check your inbox for a verification link before signing in."
            : "Account created. Verification link generated in server logs because SMTP is not configured.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
