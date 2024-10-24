import Link from 'next/link'
import { Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className='relative flex h-full flex-col items-center justify-center space-y-8 p-8 text-center'>
      <div className='absolute inset-0 -z-10 flex items-center justify-center overflow-hidden'>
        <div className='absolute size-72 animate-blob rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl' />
        <div className='absolute size-72 translate-x-[20%] translate-y-[-10%] animate-blob-delay rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl' />
      </div>

      <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>Welcome to PDF Chat</h1>
      <p className='max-w-xl text-lg text-muted-foreground'>Chat with your PDF files using AI.</p>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <Link
          className={cn(
            buttonVariants({ size: 'lg' }),
            'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-xl'
          )}
          href='/dashboard'
        >
          Start Chatting
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: 'lg' }),
            'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transition-all hover:from-blue-500 hover:to-cyan-500 hover:shadow-xl'
          )}
          href='https://github.com/afadlallah/pdf-chat'
          target='_blank'
        >
          <Github className='mr-2 size-4' />
          Star on GitHub
        </Link>
      </div>
    </div>
  )
}
