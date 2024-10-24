import { BaseLanguageModel } from '@langchain/core/language_models/base'
import type { BaseMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { BaseRetriever } from '@langchain/core/retrievers'
import type { Runnable } from '@langchain/core/runnables'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { createRetrievalChain } from 'langchain/chains/retrieval'

const historyAwarePrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
  [
    'user',
    'Given the above conversation, generate a concise vector store search query to look up in order to get information relevant to the conversation.'
  ]
])

const ANSWER_SYSTEM_TEMPLATE = `You are a helpful AI assistant designed to answer user questions.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

<context>
{context}
</context>

Please return your answer in markdown with clear headings and lists.`

const answerPrompt = ChatPromptTemplate.fromMessages([
  ['system', ANSWER_SYSTEM_TEMPLATE],
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}']
])

export async function createRAGChain(
  model: BaseLanguageModel,
  retriever: BaseRetriever
): Promise<Runnable<{ input: string; chat_history: BaseMessage[] }, string>> {
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt
  })

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: answerPrompt
  })

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: documentChain
  })

  return conversationalRetrievalChain.pick('answer')
}
