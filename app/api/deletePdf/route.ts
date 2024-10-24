import { NextRequest, NextResponse } from 'next/server'
import { deletePineconeNamespace } from '@/lib/pinecone'
import prisma from '@/lib/prisma'

const BYTESCALE_ACCOUNT_ID = process.env.NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID || 'No account ID found.'
const BYTESCALE_SECRET_KEY = process.env.BYTESCALE_SECRET_KEY || 'No secret key found.'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing document ID.' }, { status: 400 })
    }

    const document = await prisma.documents.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
    }

    await prisma.chatMessage.deleteMany({
      where: {
        documentId: id
      }
    })

    await prisma.documents.delete({
      where: { id }
    })

    try {
      const fileUrl = new URL(document.pdfUrl)
      const rawFilePath = fileUrl.pathname.replace(`/${BYTESCALE_ACCOUNT_ID}/raw`, '')
      const encodedFilePath = encodeURIComponent(rawFilePath)
      const fetchUrl = `https://api.bytescale.com/v2/accounts/${BYTESCALE_ACCOUNT_ID}/files?filePath=${encodedFilePath}`

      const response = await fetch(fetchUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${BYTESCALE_SECRET_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to delete file from Bytescale:', error)
    }

    try {
      const namespaceDeleted = await deletePineconeNamespace(id)
      if (!namespaceDeleted) {
        console.error(`Failed to delete Pinecone namespace for document: ${id}`)
      }
    } catch (error) {
      console.error('Error deleting Pinecone namespace:', error)
    }

    return NextResponse.json({ message: 'Document and associated chat messages deleted successfully.' })
  } catch (error) {
    console.error('Error deleting document and associated data:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
