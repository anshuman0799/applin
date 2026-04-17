import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_SINGLE_INTERVIEW_ROUND_NAME } from "@/lib/utils";
import { createApplicationSchema } from "@/lib/validations/application";

function normalizeApplicationInput(
  data: ReturnType<typeof createApplicationSchema.parse>,
) {
  const status = data.status ?? "Applied";
  const interviewRounds =
    status === "Interview"
      ? data.interviewRounds && data.interviewRounds.length > 0
        ? data.interviewRounds
        : [DEFAULT_SINGLE_INTERVIEW_ROUND_NAME]
      : [];

  return {
    ...data,
    status,
    interviewRounds,
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await db.application.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { notes: true } } },
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error("[APPLICATIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const application = await db.application.create({
      data: {
        ...normalizeApplicationInput(result.data),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error) {
    console.error("[APPLICATIONS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
