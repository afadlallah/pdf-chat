import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request as any)
  const documentId = request.nextUrl.searchParams.get('documentId')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        documentId: documentId,
        document: {
          userId: userId
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
