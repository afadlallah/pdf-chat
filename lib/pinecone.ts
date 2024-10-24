import { Embeddings } from '@langchain/core/embeddings'
import { PineconeStore } from '@langchain/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'

export async function loadPineconeStore({ embeddings, namespace }: { namespace: string; embeddings: Embeddings }) {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? ''
    })

    const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? ''
    if (!PINECONE_INDEX_NAME) {
      throw new Error('PINECONE_INDEX_NAME is not defined')
    }

    const index = pinecone.index(PINECONE_INDEX_NAME)

    const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index as any,
      namespace,
      textKey: 'text'
    })

    return {
      vectorstore
    }
  } catch (error) {
    console.error('Error initializing Pinecone:', error)
    throw error
  }
}

export async function deletePineconeNamespace(namespace: string) {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? ''
    })

    const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? ''
    if (!PINECONE_INDEX_NAME) {
      throw new Error('PINECONE_INDEX_NAME is not defined')
    }

    const index = pinecone.index(PINECONE_INDEX_NAME)

    await index.namespace(namespace).deleteAll()
    return true
  } catch (error) {
    console.error(`Error deleting namespace '${namespace}':`, error)
    return false
  }
}
