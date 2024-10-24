import { NextRequest, NextResponse } from 'next/server'
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai'
import type { Document } from '@langchain/core/documents'
import { AIMessage, ChatMessage, HumanMessage } from '@langchain/core/messages'
import type { Message as VercelChatMessage } from 'ai'
import { createStreamDataTransformer } from 'ai'
import { loadEmbeddingsModel } from '@/lib/loadEmbeddings'
import prisma from '@/lib/prisma'
import { createRAGChain } from '@/lib/ragChain'
import { loadRetriever } from '@/lib/vectorStore'

const CHAT_MODEL = process.env.NEXT_PUBLIC_CHAT_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1'

const formatVercelMessages = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content)
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content)
  } else {
    console.warn(`Unknown message type passed: "${message.role}". Falling back to generic message type.`)
    return new ChatMessage({ content: message.content, role: message.role })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body.messages ?? []
    if (!messages.length) {
      throw new Error('No messages provided.')
    }
    const formattedPreviousMessages = messages.slice(0, -1).map(formatVercelMessages)
    const currentMessageContent = messages[messages.length - 1].content
    const currentMessageRole = messages[messages.length - 1].role
    const chatId = body.chatId

    try {
      await prisma.chatMessage.create({
        data: {
          documentId: chatId,
          content: currentMessageContent,
          role: currentMessageRole
        }
      })
    } catch (error) {
      console.error('Error saving message to database:', error)
      throw new Error('Failed to save message to database.')
    }

    const model = new ChatTogetherAI({
      modelName: CHAT_MODEL,
      temperature: 0
    })

    const embeddings = loadEmbeddingsModel()

    let resolveWithDocuments: (value: Document[]) => void
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve
    })

    const retrieverInfo = await loadRetriever({
      chatId,
      embeddings,
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents)
          }
        }
      ]
    })

    const retriever = retrieverInfo.retriever

    const ragChain = await createRAGChain(model, retriever)

    const stream = await ragChain.stream({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages
    })

    const documents = await documentPromise
    const sources = documents.map((doc) => ({
      pageContent: doc.pageContent.slice(0, 50) + '...',
      metadata: doc.metadata
    }))

    let aiResponseContent = ''
    const transformedStream = stream
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            aiResponseContent += chunk
            controller.enqueue(chunk)
          },
          flush(controller) {
            prisma.chatMessage
              .create({
                data: {
                  documentId: chatId,
                  content: aiResponseContent,
                  role: 'assistant',
                  sources: sources.length > 0 ? sources : undefined
                }
              })
              .catch((error: any) => {
                console.error('Error saving AI response to database:', error)
              })
          }
        })
      )
      .pipeThrough(new TextEncoderStream())
      .pipeThrough(createStreamDataTransformer())

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-message-index': (formattedPreviousMessages.length + 1).toString(),
        'x-sources': Buffer.from(
          JSON.stringify(
            documents.map((doc) => {
              return {
                pageContent: doc.pageContent.slice(0, 50) + '...',
                metadata: doc.metadata
              }
            })
          )
        ).toString('base64')
      }
    })
  } catch (e: any) {
    console.error('Error in POST request:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
