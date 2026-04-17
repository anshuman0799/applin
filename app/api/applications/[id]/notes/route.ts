import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNoteSchema } from '@/lib/validations/note'

async function getApplicationForUser(applicationId: string, userId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
  })
  if (!application) return { error: 'Application not found', status: 404 }
  if (application.userId !== userId) return { error: 'Forbidden', status: 403 }
  return { application }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const check = await getApplicationForUser(id, session.user.id)
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const notes = await db.note.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: notes })
  } catch (error) {
    console.error('[NOTES_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const check = await getApplicationForUser(id, session.user.id)
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status })
    }

    const body = await req.json()
    const result = createNoteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const note = await db.note.create({
      data: { content: result.data.content, applicationId: id },
    })

    return NextResponse.json({ data: note }, { status: 201 })
  } catch (error) {
    console.error('[NOTES_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
