import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCredentialSignIn } from "@/lib/credentials-auth";

const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = credentialsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const validation = await validateCredentialSignIn(
      result.data.email,
      result.data.password,
    );

    if (validation.status === "invalid") {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (validation.status === "unverified") {
      return NextResponse.json(
        {
          error: "Email not verified.",
          code: "EMAIL_NOT_VERIFIED",
          email: validation.email,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CREDENTIALS_CHECK]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
