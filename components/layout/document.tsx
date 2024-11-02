'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Documents } from '@prisma/client'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation'
import type { ToolbarSlot, TransformToolbarSlot } from '@react-pdf-viewer/toolbar'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import { useChat } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { cn } from '@/lib/utils'
import LoadingDots from '@/components/elements/loading-dots'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function DocumentComponent({ currentDoc, userImage }: { currentDoc: Documents; userImage?: string }) {
  const toolbarPluginInstance = toolbarPlugin()
  const pageNavigationPluginInstance = pageNavigationPlugin()
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Open: () => <></>,
    SwitchTheme: () => <></>
  })

  const chatId = currentDoc.id
  const pdfUrl = currentDoc.pdfUrl

  const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  const { handleInputChange, handleSubmit, input, isLoading, messages, setMessages } = useChat({
    api: '/api/chat',
    body: {
      chatId,
      pdfUrl
    },
    onResponse(response) {
      const sourcesHeader = response.headers.get('x-sources')
      const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : []

      const messageIndexHeader = response.headers.get('x-message-index')
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources
        })
      }
    },
    onError: (e) => {
      setError(e.message)
      console.error('Chat error:', e)
    },
    onFinish(message) {
      console.log('Chat finished:', message)
    }
  })

  useEffect(() => {
    const fetchExistingMessages = async () => {
      const response = await fetch(`/api/messages?documentId=${chatId}`)
      if (response.ok) {
        const existingMessages = await response.json()
        setMessages(existingMessages)

        const sourcesMapping: Record<string, any> = {}
        existingMessages.forEach((message: any, index: number) => {
          if (message.sources) {
            sourcesMapping[index] = message.sources
          }
        })
        setSourcesForMessages(sourcesMapping)
      }
    }

    fetchExistingMessages()
  }, [chatId, setMessages])

  const messageListRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    textAreaRef.current?.focus()
  }, [])

  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && messages) {
      handleSubmit(e)
    } else if (e.key == 'Enter') {
      e.preventDefault()
    }
  }

  let userProfilePic = userImage ? userImage : '/profile-icon.png'

  const extractSourcePageNumber = (source: { metadata: Record<string, any> }) => {
    return source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber
  }

  const [showPdf, setShowPdf] = useState(false)

  return (
    <div className='flex size-full flex-col overflow-hidden border-r lg:flex-row'>
      <div className='flex items-center justify-center border-b py-2 lg:hidden'>
        <div className='flex items-center gap-3'>
          <span>Show PDF</span>
          <Switch defaultChecked checked={showPdf} onCheckedChange={setShowPdf} />
        </div>
      </div>

      <div className={cn('h-1/3 w-full overflow-hidden border-b lg:h-full lg:w-1/2 lg:border-b-0', !showPdf && 'hidden lg:block')}>
        <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'>
          <div className='flex h-full flex-col'>
            <div className='border-b'>
              <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
            </div>
            <div className='flex-1 overflow-hidden'>
              <Viewer fileUrl={pdfUrl} plugins={[toolbarPluginInstance, pageNavigationPluginInstance]} />
            </div>
          </div>
        </Worker>
      </div>

      <div
        className={cn(
          'flex w-full flex-col overflow-hidden lg:w-1/2 lg:border-l',
          showPdf ? 'h-2/3 lg:h-full' : 'h-[calc(100%-10px)] lg:h-full'
        )}
      >
        <div ref={messageListRef} className='flex-1 overflow-y-auto p-4'>
          {messages.length === 0 && <div className='flex h-full items-center justify-center text-xl'>Start chatting below!</div>}
          {messages.map((message, index) => {
            const sources = sourcesForMessages[index] || undefined
            const isLastMessage = !isLoading && index === messages.length - 1
            const previousMessages = index !== messages.length - 1
            return (
              <div
                key={`chatMessage-${index}`}
                className={`animate rounded-xl p-12 text-black ${
                  message.role === 'assistant'
                    ? 'bg-gray-100'
                    : isLoading && index === messages.length - 1
                      ? 'animate-pulse bg-white'
                      : 'bg-white'
                }`}
              >
                <div className='flex items-start'>
                  <Image
                    alt='profile image'
                    className='mr-4 rounded-sm'
                    height={35}
                    src={message.role === 'assistant' ? '/bot.png' : userProfilePic}
                    style={{ objectFit: 'contain' }}
                    width={35}
                  />
                  <ReactMarkdown className='prose'>{message.content}</ReactMarkdown>
                </div>
                {(isLastMessage || previousMessages) && sources && (
                  <div className='ml-14 mt-3 flex space-x-4'>
                    {sources
                      .filter((source: any, index: number, self: any) => {
                        const pageNumber = extractSourcePageNumber(source)
                        return self.findIndex((s: any) => extractSourcePageNumber(s) === pageNumber) === index
                      })
                      .map((source: any) => (
                        <button
                          key={extractSourcePageNumber(source)}
                          className='rounded-lg border bg-gray-200 px-3 py-1 transition hover:bg-gray-100'
                          onClick={() => pageNavigationPluginInstance.jumpToPage(Number(extractSourcePageNumber(source)) - 1)}
                        >
                          p. {extractSourcePageNumber(source)}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className='shrink-0 border-t p-4'>
          <form className='relative' onSubmit={handleSubmit}>
            <textarea
              ref={textAreaRef}
              className='w-full resize-none rounded-md border border-gray-300 bg-white p-3 pr-12 text-black focus:outline-gray-400'
              disabled={isLoading}
              placeholder={isLoading ? 'Waiting for response...' : 'Ask me anything...'}
              rows={3}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleEnter}
            />
            <Button
              className='absolute right-2 top-1/2 translate-y-[-60%] bg-transparent text-gray-600 hover:bg-transparent'
              disabled={isLoading}
              type='submit'
            >
              {isLoading ? (
                <LoadingDots color='#000' style='small' />
              ) : (
                <svg className='size-6 rotate-90 fill-current' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                </svg>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
