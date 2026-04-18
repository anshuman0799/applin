import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getInterviewRoundIndexFromStatus,
  normalizeApplicationStatus,
} from "@/lib/utils";
import { updateApplicationSchema } from "@/lib/validations/application";

async function syncInterviewRoundNotesAfterDelete(params: {
  applicationId: string;
  deletedInterviewRoundIndex: number;
  currentInterviewRounds: string[];
}) {
  const { applicationId, deletedInterviewRoundIndex, currentInterviewRounds } =
    params;

  if (
    deletedInterviewRoundIndex < 0 ||
    deletedInterviewRoundIndex >= currentInterviewRounds.length
  ) {
    return;
  }

  const deletedRoundNumber = deletedInterviewRoundIndex + 1;

  await db.note.deleteMany({
    where: {
      applicationId,
      OR:
        deletedRoundNumber === 1
          ? [
              { stage: "Interview" },
              { stage: `Interview:${deletedRoundNumber}` },
            ]
          : [{ stage: `Interview:${deletedRoundNumber}` }],
    },
  });

  for (
    let roundNumber = deletedRoundNumber + 1;
    roundNumber <= currentInterviewRounds.length;
    roundNumber += 1
  ) {
    await db.note.updateMany({
      where: {
        applicationId,
        stage: `Interview:${roundNumber}`,
      },
      data: {
        stage: `Interview:${roundNumber - 1}`,
      },
    });
  }
}

function normalizeApplicationUpdate(
  data: ReturnType<typeof updateApplicationSchema.parse>,
  currentStatus: string,
  currentInterviewRounds: string[],
) {
  const {
    deletedInterviewRoundIndex: _deletedInterviewRoundIndex,
    ...safeData
  } = data;
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
    const normalizedInterviewRounds = data.interviewRounds;

    return {
      ...safeData,
      ...normalizedOptionalFields,
      interviewRounds: normalizedInterviewRounds,
      status:
        normalizeApplicationStatus(nextStatus) === "Interview"
          ? normalizedInterviewRounds.length > 0
            ? `Interview:${getInterviewRoundIndexFromStatus(nextStatus, normalizedInterviewRounds.length) + 1}`
            : "Interview"
          : data.status,
    };
  }

  if (normalizedNextStatus === "Interview") {
    const nextInterviewRounds = safeCurrentInterviewRounds;

    return {
      ...safeData,
      ...normalizedOptionalFields,
      status:
        nextInterviewRounds.length > 0
          ? `Interview:${getInterviewRoundIndexFromStatus(nextStatus, nextInterviewRounds.length) + 1}`
          : "Interview",
      interviewRounds: nextInterviewRounds,
    };
  }

  return {
    ...safeData,
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

    if (
      result.data.deletedInterviewRoundIndex !== undefined &&
      result.data.interviewRounds !== undefined
    ) {
      await syncInterviewRoundNotesAfterDelete({
        applicationId: id,
        deletedInterviewRoundIndex: result.data.deletedInterviewRoundIndex,
        currentInterviewRounds: existing.interviewRounds,
      });
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
