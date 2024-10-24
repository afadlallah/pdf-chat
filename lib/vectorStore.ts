import { Callbacks } from '@langchain/core/callbacks/manager'
import { Embeddings } from '@langchain/core/embeddings'
import { loadPineconeStore } from '@/lib/pinecone'

export async function loadVectorStore({ embeddings, namespace }: { namespace: string; embeddings: Embeddings }) {
  const vectorStoreVal = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone'

  if (vectorStoreVal === 'pinecone') {
    return await loadPineconeStore({
      namespace,
      embeddings
    })
  } else {
    throw new Error(`Invalid vector store ID provided: ${vectorStoreVal}`)
  }
}

export async function loadRetriever({ callbacks, chatId, embeddings }: { callbacks?: Callbacks; chatId: string; embeddings: Embeddings }) {
  const store = await loadVectorStore({
    namespace: chatId,
    embeddings
  })
  const vectorstore = store.vectorstore
  const retriever = vectorstore.asRetriever({
    callbacks
  })
  return {
    retriever
  }
}
