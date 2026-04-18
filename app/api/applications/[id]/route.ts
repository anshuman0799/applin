import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DEFAULT_SINGLE_INTERVIEW_ROUND_NAME,
  getInterviewRoundIndexFromStatus,
  normalizeApplicationStatus,
} from "@/lib/utils";
import { updateApplicationSchema } from "@/lib/validations/application";

function normalizeApplicationUpdate(
  data: ReturnType<typeof updateApplicationSchema.parse>,
  currentStatus: string,
  currentInterviewRounds: string[],
) {
  const normalizedOptionalFields = {
    recruiterName:
      data.recruiterName === undefined
        ? undefined
        : data.recruiterName?.trim() || null,
    recruiterEmail:
      data.recruiterEmail === undefined
        ? undefined
        : data.recruiterEmail || null,
    recruiterPhone:
      data.recruiterPhone === undefined
        ? undefined
        : data.recruiterPhone?.trim() || null,
    recruiterSocial:
      data.recruiterSocial === undefined
        ? undefined
        : data.recruiterSocial || null,
  };
  const nextStatus = data.status ?? currentStatus;
  const normalizedNextStatus = normalizeApplicationStatus(nextStatus);
  const safeCurrentInterviewRounds = Array.isArray(currentInterviewRounds)
    ? currentInterviewRounds
    : [];

  if (data.interviewRounds !== undefined) {
    const normalizedInterviewRounds =
      data.interviewRounds.length > 0
        ? data.interviewRounds
        : [DEFAULT_SINGLE_INTERVIEW_ROUND_NAME];

    return {
      ...data,
      ...normalizedOptionalFields,
      interviewRounds: normalizedInterviewRounds,
      status:
        normalizeApplicationStatus(nextStatus) === "Interview"
          ? `Interview:${getInterviewRoundIndexFromStatus(nextStatus, normalizedInterviewRounds.length) + 1}`
          : data.status,
    };
  }

  if (normalizedNextStatus === "Interview") {
    const nextInterviewRounds =
      safeCurrentInterviewRounds.length > 0
        ? safeCurrentInterviewRounds
        : [DEFAULT_SINGLE_INTERVIEW_ROUND_NAME];

    return {
      ...data,
      ...normalizedOptionalFields,
      status: `Interview:${getInterviewRoundIndexFromStatus(nextStatus, nextInterviewRounds.length) + 1}`,
      interviewRounds: nextInterviewRounds,
    };
  }

  return {
    ...data,
    ...normalizedOptionalFields,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.application.findUnique({
      where: { id },
      include: { notes: { orderBy: { createdAt: "desc" } } },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("[APPLICATION_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = updateApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const application = await db.application.update({
      where: { id },
      data: normalizeApplicationUpdate(
        result.data,
        existing.status,
        existing.interviewRounds,
      ),
    });

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("[APPLICATION_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.application.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[APPLICATION_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
