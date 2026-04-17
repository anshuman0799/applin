import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateNoteSchema } from "@/lib/validations/note";

async function getNoteForUser(
  noteId: string,
  applicationId: string,
  userId: string,
) {
  const note = await db.note.findUnique({
    where: { id: noteId },
    include: { application: { select: { userId: true } } },
  });
  if (!note || note.applicationId !== applicationId) {
    return { error: "Note not found", status: 404 };
  }
  if (note.application.userId !== userId) {
    return { error: "Forbidden", status: 403 };
  }
  return { note };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await params;
    const check = await getNoteForUser(noteId, id, session.user.id);
    if (check.error) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const body = await req.json();
    const result = updateNoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const note = await db.note.update({
      where: { id: noteId },
      data: {
        ...result.data,
        stage:
          result.data.stage === undefined
            ? undefined
            : (result.data.stage ?? null),
      },
    });

    return NextResponse.json({ data: note });
  } catch (error) {
    console.error("[NOTE_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await params;
    const check = await getNoteForUser(noteId, id, session.user.id);
    if (check.error) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    await db.note.delete({ where: { id: noteId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NOTE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
