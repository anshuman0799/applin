import { NextResponse } from "next/server";
import { z } from "zod";
import { resendEmailVerification } from "@/lib/email-verification";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resendSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const resendResult = await resendEmailVerification(result.data.email);

    if (resendResult.status === "sent") {
      return NextResponse.json({
        message:
          resendResult.delivery === "smtp"
            ? "Verification link sent. Check your inbox."
            : "Verification link generated. Check the server logs because SMTP is not configured.",
      });
    }

    return NextResponse.json({
      message:
        "If that email can be verified, a fresh verification link is now available.",
    });
  } catch (error) {
    console.error("[VERIFY_EMAIL_RESEND]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
