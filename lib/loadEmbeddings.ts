import { OpenAIEmbeddings } from '@langchain/openai'

export function loadEmbeddingsModel() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set. Please add your OpenAI API key to your environment variables.')
    }

    const apiKey = process.env.OPENAI_API_KEY.trim()
    if (apiKey.length === 0) {
      throw new Error('OPENAI_API_KEY is empty. Please provide a valid OpenAI API key.')
    }

    // Validate API key format (should start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. API keys should start with "sk-".')
    }

    const modelName = process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-ada-002'

    return new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: modelName,
      maxRetries: 3,
      timeout: 30000 // 30 second timeout
    })
  } catch (error) {
    console.error('Error initializing embeddings:', error)
    throw error
  }
}
