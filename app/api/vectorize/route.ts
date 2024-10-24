import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { loadEmbeddingsModel } from '@/lib/loadEmbeddings'
import prisma from '@/lib/prisma'
import { loadVectorStore } from '@/lib/vectorStore'

export async function POST(request: Request) {
  const { pdfTitle, pdfUrl } = await request.json()
  const { userId } = getAuth(request as any)
  let namespace: string
  let doc: any
  let embeddingAttempts = 0
  const MAX_EMBEDDING_ATTEMPTS = 2

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to upload a PDF.' }, { status: 401 })
  }

  try {
    const numDocs = await prisma.documents.count({
      where: {
        userId
      }
    })

    if (numDocs > 3) {
      return NextResponse.json(
        {
          error: 'You have reached the maximum number of documents allowed.'
        },
        { status: 400 }
      )
    }

    const response = await fetch(pdfUrl)
    const buffer = await response.arrayBuffer()
    const pdfSize = buffer.byteLength

    doc = await prisma.documents.create({
      data: {
        pdfTitle,
        pdfUrl,
        pdfSize,
        userId
      }
    })

    namespace = doc.id

    const loader = new PDFLoader(new Blob([buffer]))
    const rawDocs = await loader.load()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
    const splitDocs = await textSplitter.splitDocuments(rawDocs)

    while (embeddingAttempts < MAX_EMBEDDING_ATTEMPTS) {
      try {
        embeddingAttempts++

        const embeddings = loadEmbeddingsModel()

        const store = await loadVectorStore({
          namespace: doc.id,
          embeddings
        })
        const vectorstore = store.vectorstore

        await vectorstore.addDocuments(splitDocs)

        break
      } catch (embeddingError) {
        console.error('Error adding documents to vector store:', embeddingError)

        if (embeddingAttempts >= MAX_EMBEDDING_ATTEMPTS) {
          if (doc) {
            await prisma.documents.delete({
              where: { id: doc.id }
            })
          }
          throw new Error('Failed to process document after multiple attempts')
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  } catch (error: any) {
    if (doc) {
      await prisma.documents.delete({
        where: { id: doc.id }
      })
    }

    console.error('Error processing PDF:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to process your document.'
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    text: 'Successfully embedded PDF.',
    id: namespace
  })
}
