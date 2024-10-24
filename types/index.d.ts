import { Document } from 'langchain/document'

export type Message = {
  isStreaming?: boolean
  message: string
  sourceDocs?: Document[]
  type: 'apiMessage' | 'userMessage'
}
