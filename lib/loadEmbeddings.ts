import { OpenAIEmbeddings } from '@langchain/openai'

export function loadEmbeddingsModel() {
  try {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL
      })
    }

    throw new Error('No embedding service API keys found.')
  } catch (error) {
    console.error('Error initializing embeddings:', error)
    throw error
  }
}
