import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getInterviewRoundIndexFromStatus,
  normalizeApplicationStatus,
} from "@/lib/utils";
import { createApplicationSchema } from "@/lib/validations/application";

function normalizeApplicationInput(
  data: ReturnType<typeof createApplicationSchema.parse>,
) {
  const {
    deletedInterviewRoundIndex: _deletedInterviewRoundIndex,
    ...safeData
  } = data;
  const status = data.status ?? "Applied";
  const normalizedStatus = normalizeApplicationStatus(status);
  const interviewRounds =
    normalizedStatus === "Interview"
      ? data.interviewRounds && data.interviewRounds.length > 0
        ? data.interviewRounds
        : []
      : [];

  const clampedStatus =
    normalizedStatus === "Interview"
      ? interviewRounds.length > 0
        ? `Interview:${getInterviewRoundIndexFromStatus(status, interviewRounds.length) + 1}`
        : "Interview"
      : status;

  return {
    ...safeData,
    status: clampedStatus,
    interviewRounds,
    recruiterName: data.recruiterName?.trim() || null,
    recruiterEmail: data.recruiterEmail || null,
    recruiterPhone: data.recruiterPhone?.trim() || null,
    recruiterSocial: data.recruiterSocial || null,
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
